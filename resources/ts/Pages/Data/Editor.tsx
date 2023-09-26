import React, { useState, useEffect } from 'react'
import { toast } from 'react-toastify';
import { is_json } from '@/classes/util'
import axios, { AxiosError } from 'axios';
import BasicLayout from '@/Layouts/BasicLayout';
import RenderAnnotation from '@/Components/RenderAnnotation';
import RenderImage from '@/Components/RenderImage';
import Form from './Partials/Form'
import { useTranslation } from 'react-i18next';


declare var route;

const EXECUTING = {
    NONE: 0,
    OCR: 1,
    LABEL: 2,
    SAVE: 3,
    UPDATE: 4,
}

const Editor = ({
    item,
    google_ocr_url,
    google_ocr_token,
    ner_ai_url,
    ner_ai_token,
    labels,
    auth
}) =>
{
    const [t, i18n] = useTranslation()
    const [ file, setFile ] = useState(null);
    const [ imageDataURL, setImageDataURL ] = useState(item?.file_path ? route('/') + '/storage/' + item.file_path : null);
    const [ ocrResult, setOcrResult ] = useState(item?.text ? JSON.parse(item.text) : '');
    const [ entities, setEntities ] = useState(item?.entities ? JSON.parse(item.entities) : []);
    const [ editData, setEditData ] = useState(item ? item : {});
    const [ executing, setExecuting ] = useState(EXECUTING.NONE);

    console.log(item);

    const changeFile = async (e) =>
    {
        const f = e.target.files[0];
        if (
            f.type !== 'image/jpeg' &&
            f.type !== 'image/png'
        )
        {
            return;
        }
        setFile(f);
    }

    useEffect(() =>
    {
        if (!file) return;

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () =>
        {
            setImageDataURL(reader.result);
        }
    }, [file]);

    const executeOcr = async () =>
    {
        if (executing != EXECUTING.NONE) return
        setExecuting(() => EXECUTING.OCR);

        const data = new FormData()
        data.append('image', file)
        axios.post(route('api.ocr'), data, {
            headers: { 'content-type': 'multipart/form-data' }
        })
        .then(res => {
            console.log('success', res)
            setOcrResult(res.data);
        }).catch(error => {
            new Error(error)
        }).finally(() =>
        {
            setExecuting(() => EXECUTING.NONE);
            console.log('finally')
        });
            /*
        setExecuting(() => EXECUTING.OCR);
        const params = new URLSearchParams();
        params.append('filename', 'tmp.png');
        params.append('file', imageDataURL
            .replace('data:image/jpeg;base64,', '')
            .replace('data:image/png;base64,', '')
        );
        params.append('token', google_ocr_token);
        fetch(google_ocr_url,{
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params,
        }).then((res) => res.json())
        .then((data) =>
        {
            setOcrResult(data.result);
        
        }).catch((e ) =>
        {
            console.error(e)
        }).finally(() =>
        {
            setExecuting(() => EXECUTING.NONE);
            console.log('finally')
        });

        // axios では CORS で動かない。
        */
    }

    const executeLabelingAI = () =>
    {
        setExecuting(() => EXECUTING.LABEL);
        fetch(ner_ai_url,{
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text: ocrResult,
                    token: ner_ai_token,
                }),
            }).then((res) => {
                console.log('res',res);
                return res.json()
            })
            .then((data) =>
            {
                setEntities(data);
                const newEditData = {};
                data.map((entity) =>
                {
                    newEditData[entity.label] = entity.name;
                });
                setEditData(newEditData);
            }).catch((e ) =>
            {
                console.error(e)
            }).finally(() =>
            {
                setExecuting(() => EXECUTING.NONE);
                console.log('finally')
            });
    }

    const save = async () =>
    {
        setExecuting(() => EXECUTING.SAVE);
        const formData = new FormData();
        Object.keys(editData).map((key) => {
            formData.append(key, key in editData ? editData[key]: '');
        });
        formData.append('text', JSON.stringify(ocrResult))
        formData.append('entities', JSON.stringify(entities))
        if (file) formData.append('file', file);
        /*
            .replace('data:image/jpeg;base64,', '')
            .replace('data:image/png;base64,', '')
        );
        */

        const url = item ? route('api.data.save', {data: item.id}): route('api.data.save');

        await axios.post(url, formData)
            .then((res) => {
                toast.success('保存しました。編集ページへ移動します。', {
                    onClose: () => location.href = route('data.edit', { data: res.data.id })
                });
                console.log(res);
            })
            .catch((e: AxiosError) => {
                console.error(e)
            }).
            finally(() => {
                setExecuting(() => EXECUTING.NONE);
            });
    }

    return (<BasicLayout
        auth={auth}
        title={item ? `${t('データの編集')} ID:${item.id}`: t('新規作成')}
        className="data editor"
    >
        <section className="control">
            <div className="content">
                 {!imageDataURL && (
                    <input type='file' onChange={changeFile} accept="image/*" className="mb-2" />
                 )}
                <button className="button" onClick={executeOcr} disabled={!file || ocrResult} >OCR</button>
                <button className="button" onClick={executeLabelingAI} disabled={!ocrResult || entities.length > 0}>{t('ラベリング')}</button>
                <button className="button" onClick={save} disabled={entities.length < 1}>{t('保存')}</button>
            </div>
        </section>

        <section className="">
            <div className="content">
                <Form
                    imageData={imageDataURL}
                    ocrText={ocrResult}
                    entities={entities}
                    editData={editData}
                    setEditData={setEditData}
                    labels={labels}
                    executing={
                        (executing == EXECUTING.OCR) && t('OCR実行中') || 
                        (executing == EXECUTING.LABEL) && t('ラベリング実行中') || 
                        (executing == EXECUTING.SAVE) && t('保存中') || 
                        (executing == EXECUTING.UPDATE) && t('更新中') ||
                        false
                    }
                />
            </div>
        </section>
    </BasicLayout>)
}

export default Editor;