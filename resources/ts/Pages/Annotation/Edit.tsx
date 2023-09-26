import React, { useEffect } from 'react';
import BasicLayout from '@/Layouts/BasicLayout';
import RenderAnnotation from '@/Components/RenderAnnotation';
import RenderImage from '@/Components/RenderImage';
import { toast } from 'react-toastify';
import { useState, useRef } from 'react'
import { is_json } from '@/classes/util'
import axios from 'axios';
import { useTranslation } from 'react-i18next';

// axios.defaults.baseURL = 'http://localhost';
axios.defaults.headers.post['Content-Type'] = 'application/json;charset=utf-8';
axios.defaults.headers.post['Access-Control-Allow-Origin'] = '*';

declare var route;

const Annotation = ({
    auth,
    data,
    labels,
    prev,
    next,
}) =>
{

    const [t, i18n] = useTranslation();
    /*
    const [lang, setLang] = useState('en');
    useEffect(() => {
        i18n.changeLanguage(lang);
    }, [lang, i18n]);
    */

    const [ enableShortcutKey, setEnableShortcutKey ] = useState(true);
    const [ memoValue, setMemoValue ] = useState(data.memo ? data.memo : '');
 
    const text = data.text;

    const [entities, setEntities] = useState(is_json(data.entities) && Array.isArray(JSON.parse(data.entities)) ? JSON.parse(data.entities) : []);

    const shortcuts = {}
    Object.keys(labels).map((key) => shortcuts[labels[key]['shortcut']] = key);

    const getStartEndText = () =>
    {
        let startPos = Math.min(document.getSelection().anchorOffset, document.getSelection().focusOffset);
        let endPos   = Math.max(document.getSelection().anchorOffset, document.getSelection().focusOffset);
        let text = document.getSelection().toString()
        // 前後の空白を除去
        if (text != text.trim())
        {
            startPos += text.indexOf(text.trim());
            endPos = startPos + text.trim().length;
            text = text.trim();
        }
        return {
            startPos: startPos,
            endPos: endPos,
            text: text,
        }
    }

    const addAnnotation = (label) =>
    {
        if (
            document.getSelection().anchorNode.parentElement.id != 'select-text'
        )
        {
            return;
        }

        const { startPos, endPos, text }  = getStartEndText()

        if (startPos == endPos) return; // スペースも考慮して

        const new_entities = entities.slice();
        let is_error;
        for (let i = 0; i < new_entities.length; i++)
        {
            const entity = new_entities[i];
            if (entity.span[0] == startPos && endPos == entity.span[1]) // 全く同じだったら置換
            {
                new_entities[i] = {
                    name: text,
                    span: [ startPos, endPos ],
                    label: label,
                };
                setEntities(new_entities);
                is_error = true;
            }
            else if (
                (entity.span[0] <= startPos && startPos < entity.span[1]) ||
                (entity.span[0] < endPos && endPos <= entity.span[1])
            )
            {
                is_error = true;
                toast.error('範囲が重複しています。');
                break
            }
        }
        if (is_error)
        {
            return;
        }

        // 上記以外は追加
        new_entities.push({
            name: text,
            span: [ startPos, endPos ],
            label: label,
        });
        setEntities(new_entities);

        /*
        {
        if (document.selection) {
            var text = document.selection.createRange().text;
          // それ以外
          } else {
            var text = document.getSelection();
          }
        }
        */
    }

    const removeAnnotation = (label) =>
    {
        // 選択範囲が同じだったらその要素のみ除去
        if (
            document.getSelection().anchorNode &&
            document.getSelection().anchorNode.parentElement.id == 'select-text' &&
            ! document.getSelection().isCollapsed
        )
        {
            const { startPos, endPos, text }  = getStartEndText();
            const new_entities = entities.slice();
            for (let i = 0; i < new_entities.length; i++)
            {
                const entity = new_entities[i];
                if (entity.span[0] == startPos && endPos == entity.span[1] && entity.label == label) // 全く同じだったら置換
                {
                    new_entities.splice(i, 1);
                    setEntities(new_entities);
                    return;
                } 
            }
        }
        
        // 上記以外は、label が一致した要素を除去
        const replaces_entities = entities.filter((entity) => {
            return entity.label != label
        });

        setEntities(replaces_entities);
    }

    const onKeyDown = (e) =>
    {
        if (!enableShortcutKey) return;

        if (e.ctrlKey || e.altKey) return;

        const keyCode = e.keyCode;

        if ( keyCode in shortcuts)
        {
            e.preventDefault();
            if (e.shiftKey)
            {
                removeAnnotation(shortcuts[keyCode]);
            }
            else
            {
                addAnnotation(shortcuts[keyCode]);
            }
        }
    }
    document.onkeydown = onKeyDown;

    const handleSubmit = async (finished) =>
    {
        const formData = new FormData();
        formData.append('entities', JSON.stringify(entities))
        formData.append('memo', memoValue)
        formData.append('entity_edited_as_2', finished ? '2' :'1')

        await axios.post(route('api.annotation.update', {'annotation': data.id}), formData)
            .then((res) => {
                toast.success('保存しました。ページを再読み込みします。', {
                    onClose: () => location.reload()
                });
                console.log(res);
            })
            .catch((e: AxiosError) => {
                console.error(e)
            }).
            finally(() => {
            });
    }

    console.log(shortcuts)

    const lensSize = 1200;
    const [ zoomAttach, setZoomAttach ] = useState(false);
    const [ zoom, setZoom ] = useState(false);
	const [ zoomXY, setZoomXY ] = useState([0,0]);
	const [ mouseXY, setMouseXY ] = useState([0,0]);
    const [ zoomPixel, setZoomPixel ] = useState(2500);

    const mouseMove = (e) =>
	{
        if (zoomAttach) return;
		const diff = lensSize/2;

        console.log('mouse move')

		setZoomXY([
			fullImage.current.width * (e.nativeEvent.offsetX / e.target.clientWidth) * -1 + diff,
			fullImage.current.height * (e.nativeEvent.offsetY / e.target.clientHeight) * -1 + diff,
		]);

		setMouseXY([
			e.nativeEvent.offsetX - diff + e.target.offsetLeft,
			e.nativeEvent.offsetY - diff + e.target.offsetTop,
		]);
	}

	const fullImageBox = useRef();
	const fullImage = useRef();

    console.log('labels', labels)
    return (<BasicLayout
            auth={auth}
            title={`${data.code} (${t('優先順位')}: ${data.priority})`}
            className="annotation edit"
    >
        <section className="control">
            <div className="content flex justify-between">
                <div className="">
                    <button className="button primary mr-2" onClick={() => handleSubmit(false)}>{t('一時保存')}</button>
                    <button className="button primary mr-2" onClick={() => handleSubmit(true)}>{t('作業済みにして保存')}</button>
                    {data.entity_edited_as_2 == 2 && (<span className="text-green-600">{t('作業済み')}</span>)}
                    {data.entity_edited_as_2 == 1 && (<span className="text-orange-600">{t('作業中')}</span>)}
                </div>

                <div className="flex">
                    {prev && (<a className="button secondary block" href={route('annotation.edit', {'annotation': prev.id})}>{t('前')}</a>)}
                    {next && (<a className="button secondary block ml-2" href={route('annotation.edit', {'annotation': next.id})}>{t('次')}</a>)}
                </div>
            </div>
        </section>

        <section className="editor">
            <div className="content">
                <div className="flex relative">

                    <div className="w-3/5 border flex flex-col space-between">
                        {RenderAnnotation({
                            selectTextId: 'select-text',
                            text: text,
                            entities: entities,
                            labels: labels
                        })}

                        <div className="p-2 border-y-8">
                            <h3 className="font-bold">Memo</h3>
                            <textarea className="w-full" value={memoValue} onChange={(e) => setMemoValue(e.target.value)} />
                        </div>

                        <div className="border">
                            <table>
                                <tbody>
                                    <tr>
                                        <th>{t('識別用番号')}</th>
                                        <td>{data['code']}</td>
                                    </tr>
                                    {Object.keys(labels).map((key) => (
                                        <tr>
                                            <th>{t(labels[key].name)}</th>
                                            <th>{t(labels[key].long_name)}</th>
                                            
                                            <td>{JSON.parse(data['data'])[key]}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div class=" p-4 border w-2/5 overflow-hidden relative">
                        <RenderImage
                            href={`${route('/')}/storage/annotation/${data.user_id}/${data.id}.webp`}
                            src={`${route('/')}/storage/annotation/${data.user_id}/${data.id}.webp`}
                            srcZoom={`${route('/')}/storage/annotation/${data.user_id}/${data.id}.webp`}
                        />

                        <div className="mt-4">
                            <label>
                                <input type="checkbox" checked={enableShortcutKey} onChange={() => setEnableShortcutKey(!enableShortcutKey)} />
                                {t('ショートカットキーを有効に')}
                            </label>
                        </div>
                        <table className="">
                            <thead>
                                <th>SC</th>
                                <th>{t('ラベル')}</th>
                                <th>{t('要素数')}</th>
                                <th colSpan={2}>{t('操作')}</th>
                                <th></th>
                            </thead>
                            <tbody>
                            {Object.keys(labels).map((label, index) => (<tr className={`${[3,6,9,13].includes(index) ? 'border-b-4' : ''}`}>
                                <td>
                                    {enableShortcutKey && <span className="shortcut rounded-md border border-slate-800 w-6 block text-center">
                                        {String.fromCharCode(parseInt(Object.keys(shortcuts).find((key) => shortcuts[key] == label)))}
                                    </span>}
                                </td>
                                <th className="text-left">{t(labels[label].name)}</th>
                                <td className={`len-${entities.filter(e => e.label === label).length} text-center`}>{ entities.filter(e => e.label === label).length }</td>
                                <td className="text-center">
                                    <button
                                        className="button small mr-2"
                                        onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        addAnnotation(label)
                                    }}>{t('追加')}</button>
                                    <button
                                        className="button small delete"
                                        onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        removeAnnotation(label)
                                    }}>{t('削除')}</button>
                                </td>

                                </tr>))}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </section>

        <section className="help">
            <h1>ヘルプ</h1>
            <div className="content">
                <dl>
                    <dt>{t('ラベルの追加')}</dt>
                    <dd>{t('該当範囲を選択して「追加」ボタン、もしくはショートカットキー(SC)。')}</dd>
                    <dt>{t('ラベルの削除')}</dt>
                    <dd>{t('「削除」ボタン、もしくは Shift + ショートカットキー(SC)で、任意のラベルの全削除。')}</dd>
                    <dt>{t('ラベルの変更と単一の削除')}</dt>
                    <dd>{t('選択範囲にすでにラベルがある場合は"ラベルの追加"と同じ操作でラベルの変更ができます。 ')}<br />
                        {t('また、選択範囲にラベルがある状態で"ラベルの削除"の操作をすると、その箇所のみラベルを削除することができます。')}</dd>
                    <dt>{t('ショートカットキー(sc)の有効・無効')}</dt>
                    <dd>{t('ショートショートカットキーはデフォルトで有効になっています。無効にする際はチェックを外してください。')}<br />
                        {t('ショートカットキーが有効な有効な状態でも、「Ctrl」や「Alt」を押下する操作は従来通り使えます。')}</dd>
                    <dt>{t('画像')}</dt>
                    <dd>{t('マウスオーバーで画像の拡大。')}<span className="text-red-600">{t('クリックで拡大表示をその場に固定します。')}</span></dd>
                    <dt>{t('保存ボタン')}</dt>
                    <dd>{t('「一時保存」「作業済みにして保存」のどちらで保存するかで、保存後のデータの状態が変わります。')}<br />
                        {t('・「一時保存」→「作業中」')}<br />
                        {t('・「作業済みにして保存」→「作業済」')}<br />
                        {t('実際に学習データとして使用するのは「作業済」のデータになります。自信がないデータは作業中で置いておいてください。')}
                    </dd>
                    <dt>{t('メモ')}</dt>
                    <dd>{t('保存時にメモ欄に記載した内容も保存されます。自信のないラベルの内容などを記載しておいてください。')}</dd>
                    <dt>{t('「前」「次」ボタン')}</dt>
                    <dd>{t('前後のデータの編集画面に移動できます。保存後一覧に戻らず作業を続けることができます。')}</dd>
                </dl>
                <ul>
                    <li>{t('保存は忘れずにお願いします。作業途中でページを閉じると、作業内容が失われます。')}</li>
                    <li>{t('ラベルの追加時に、前後のスペースは無視されますので、ガバッと選択して大丈夫です。ダブルクリックで単語の選択。トリプルクリックでの行選択などをうまく活用してください。')}</li>
                    <li>{t('「Ctrl + F」でテキスト検索ができます。ラベルを探す際に活用してください。')}</li>
                    <li>{t('「Ctrl + R」でページの再読み込みができますので、作業を最初からやり直したい場合などに活用してください。')}</li>
                    <li>{t('間違った文字が紛れ込んでいるものも、分割せずにひと固まりで選択し、ラベル付けしてください。')}<br />
                        {t('そのほうが AI の精度が上がるのと、間違ったテキストは登録時に消せば済むからです。結果的にすべてのラベルが 0 か 1 個になるのが理想です。')}
                    </li>
                    <li>{t('一覧画面で検索し複数のデータを編集したい場合は、新しいタブで開いて編集するのが便利です。「Ctrl」を押しながらクリックでタブで開けます。')}</li>
                </ul>
            </div>
        </section>

    </BasicLayout>);
}


export default Annotation;