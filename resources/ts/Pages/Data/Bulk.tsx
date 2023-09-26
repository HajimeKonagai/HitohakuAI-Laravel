import React, { useState, useEffect } from 'react'
import { toast } from 'react-toastify';
import { is_json } from '@/classes/util'
import axios, { AxiosError } from 'axios';
import BasicLayout from '@/Layouts/BasicLayout';
import RenderAnnotation from '@/Components/RenderAnnotation';
import RenderImage from '@/Components/RenderImage';
import Form from './Partials/Form';

import { useTranslation } from 'react-i18next';

declare var route;

const EXECUTING = {
    NONE: 0,
    OCR: 1,
    LABEL: 2,
    SAVE: 3,
    UPDATE: 4,
}

const Bulk = ({
    google_ocr_url,
    google_ocr_token,
    ner_ai_url,
    ner_ai_token,
    labels,
    auth,
}) =>
{
    const [t, i18n] = useTranslation()

    const MAX_FILE_NUM = 10;
    const [ executing, setExecuting ] = useState(EXECUTING.NONE);
    const [ bulkEditData, setBulkEditData ] = useState([]);
    const [ allSaved, setAllSaved ] = useState([]);

    const changeFiles = (e) =>
    {
        if ((e.target.files.length + bulkEditData.length) > MAX_FILE_NUM)
        {
            toast.error('試用版につき、扱えるファイルは ' + MAX_FILE_NUM + ' までにしています。')
        }
        
        for (let i = 0; i  < Math.min(e.target.files.length, e.target.files.length + (MAX_FILE_NUM - (e.target.files.length + bulkEditData.length))); i++)
        {
            console.log(i);
            const file = e.target.files[i];
            if (file.type !== 'image/jpeg' && file.type !== 'image/png')
            {
                return;
        }
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () =>
            {
                setBulkEditData((before) =>
                {
                    const newData = before.slice();
                    newData.push({
                        file: file,
                        imageData: reader.result,
                        ocrText: null,
                        entities: null,
                        editData: {},
                        saved: false,
                        saved_id: null
                    });
                    return newData;
                });
            }
        }
    }

    useEffect(() =>
    {
        executeSequence();
    }, [executing]);

    const executeSequence = () =>
    {
            console.log(executing);
        switch (executing)
        {
            case EXECUTING.OCR:
            {
                const findIndex = bulkEditData.findIndex((d) => !d.ocrText);
                if (findIndex > -1) {
                    executeOcr(findIndex);
                } else {
                    setExecuting(EXECUTING.NONE);
                }
                break;
            }
            case EXECUTING.LABEL:
            {
                const findIndex = bulkEditData.findIndex((d) => d.ocrText && !d.entities);
                if (findIndex > -1) {
                    executeLabeling(findIndex);
                } else {
                    setExecuting(EXECUTING.NONE);
                }
                break;
            }
            case EXECUTING.SAVE:
            {
                const findIndex = bulkEditData.findIndex((d) => !d.saved);
                if (findIndex > -1) {
                    save(findIndex);
                } else {
                    toast.success(<>
                        すべて保存しました。<br />
                        このままさらに編集する事ができます。<br />
                        また、ページを閉じた後も、一覧から個別に編集することができます。<br />
                        CSVエクスポートのデータは引き続き行えますが、一覧の検索結果からもエクスポートは可能です。
                    </>, { autoClose: false});
                    setBulkEditData((before) =>
                    {
                        const newData = before.slice();
                        before.map((b, i) => {
                            before[i].saved = false;
                        })
                        return newData;
                    });
                    setExecuting(EXECUTING.NONE);
                }
                break;
            }
            case EXECUTING.UPDATE:
            {
                const findIndex = bulkEditData.findIndex((d) => !d.saved);
                if (findIndex > -1) {
                    save(findIndex);
                } else {
                    toast.success(<>
                        すべて更新しました。<br />
                        このままさらに編集する事ができます。<br />
                        また、ページを閉じた後も、一覧から個別に編集することができます。<br />
                        CSVエクスポートのデータは引き続き行えますが、一覧の検索結果からもエクスポートは可能です。
                    </>);
                    setBulkEditData((before) =>
                    {
                        const newData = before.slice();
                        before.map((b, i) => {
                            before[i].saved = false;
                        })
                        return newData;
                    });
                    setExecuting(EXECUTING.NONE);
                }
                break;
            }

        }

    }

    useEffect(() =>
    {
        // 一瞬あける
        setTimeout(() =>
        {
            executeSequence();
        }, 100);

    }, [ bulkEditData ])

    const executeOcr = async (index) =>
    {
        if (bulkEditData[index].ocrText) return;


        const data = new FormData()
        data.append('image', bulkEditData[index].file)
        axios.post(route('api.ocr'), data, {
            headers: { 'content-type': 'multipart/form-data' }
        })
        .then(res => {

            setBulkEditData((before) =>
            {
                const newData = before.slice();
                newData[index].ocrText = res.data;
                return newData;
            });
        }).catch(error => {
            new Error(error)
        }).finally(() =>
        {
            console.log('finally')
        });

        /*
        const params = new URLSearchParams();
        params.append('filename', 'tmp.png');
        params.append('file', bulkEditData[index].imageData
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
            setBulkEditData((before) =>
            {
                const newData = before.slice();
                newData[index].ocrText = data.result;
                return newData;
            });
        }).catch((e ) =>
        {
            console.error(e)
        }).finally(() =>
        {
            console.log('finally')
        });
        */
    }

    const executeLabeling = (index) =>
    {
        if (!bulkEditData[index].ocrText || bulkEditData[index].ocrText == '') return;
        if (bulkEditData[index].entities?.length > 0) return;

        fetch(ner_ai_url,{
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text: bulkEditData[index].ocrText,
                    token: ner_ai_token,
                }),
            }).then((res) => res.json())
            .then((data) =>
            {
                console.log(data);
                setBulkEditData((before) =>
                {
                    const newData = before.slice();
                    newData[index].entities = data;
                    const newEditData = {};
                    data.map((entity) =>
                    {
                        newEditData[entity.label] = entity.name;
                    });
                    newData[index].editData = newEditData;
                    return newData;
                });
            }).catch((e ) =>
            {
                setBulkEditData((before) =>
                {
                    const newData = before.slice();
                    return newData;
                });
            }).finally(() =>
            {


                console.log('finally')
            });
    }

    const updateEditData = (index, newRowData) =>
    {
        setBulkEditData((before) =>
        {
            const newData = before.slice();
            newData[index].editData = newRowData;
            return newData;
        });
    }

    const csvExport = () =>
    {
        const exportData:string[] = [];

        const header:string[] = [];
        header.push(t('識別用コード'));
        Object.keys(labels).map((key) =>
        {
            header.push(t(labels[key].name()));
        });
        exportData.push('"' + header.join('","') + '"');

        bulkEditData.map((d) =>
        {
            const arr:string[] = [];
            arr.push('code' in d.editData && d.editData['code'] ? d.editData['code'].replace('"', '""') : '');
            Object.keys(labels).map((key) =>
            {
                if (key in d.editData)
                {
                    arr.push(d.editData[key].replace('"', '""'));
                }
                else
                {
                    arr.push('');
                }
            });
            exportData.push('"' + arr.join('","') + '"');
        })

        const exportStr = exportData.join('\n');

        var blob =new Blob([exportStr], {type:"text/csv"}); //配列に上記の文字列(str)を設定
        var link =document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download ="Export.csv";
        link.click();
    }

    const save = async (index) =>
    {
        const formData = new FormData();
        Object.keys(bulkEditData[index].editData).map((key) => {
            formData.append(key, key in bulkEditData[index].editData ? bulkEditData[index].editData[key]: '');
        });
        if (bulkEditData[index].ocrText) formData.append('text', JSON.stringify(bulkEditData[index].ocrText))
        if (bulkEditData[index].entities) formData.append('entities', JSON.stringify(bulkEditData[index].entities))
        if (bulkEditData[index].imageData && !bulkEditData[index].saved_id) formData.append('file', bulkEditData[index].file);
        /*
            .replace('data:image/jpeg;base64,', '')
            .replace('data:image/png;base64,', '')
        );
        */

        const url = bulkEditData[index].saved_id ? route('api.data.save', { data: bulkEditData[index].saved_id}) : route('api.data.save') ;

        console.log(url);

        await axios.post(url, formData)
            .then((res) => {
                console.log(res);
                setBulkEditData((before) =>
                {
                    const newData = before.slice();
                    newData[index].saved = true;
                    newData[index].saved_id = res.data.id;
                    return newData;
                });
            })
            .catch((e: AxiosError) => {
                console.error(e)
            }).
            finally(() => {
            });
    }


    return (<BasicLayout
        auth={auth}
        title={t('一括登録')}
        className="data bulk"
    >

        <section>
            <div className="content">
                {bulkEditData.length < 1 && (
                    <input
                        type='file'
                        onChange={changeFiles}
                        multiple={true}
                        accept="image/*" />
                )}

                {bulkEditData.length > 0 && (<>
                    <button
                        className="button mr-2"
                        onClick={() => setExecuting(EXECUTING.OCR)}
                        disabled={! (bulkEditData.filter((d) => !d.ocrText).length > 0 && executing == EXECUTING.NONE)}
                    >
                        OCR
                    </button>
                    <button
                        className="button mr-2"
                        onClick={() => setExecuting(EXECUTING.LABEL)}
                        disabled={! (bulkEditData.filter((d) => d.ocrText && ! d.entities).length > 0 && executing == EXECUTING.NONE)}
                    >
                        {t('ラベリング')}
                    </button>
                    <button
                        className="button mr-2"
                        onClick={() => {
                            if (bulkEditData.filter((d) => d.saved_id).length > 0) {
                                setExecuting(EXECUTING.UPDATE);
                            } else {
                                setExecuting(EXECUTING.SAVE);
                            }
                        }}
                        disabled={! (bulkEditData.filter((d) => d.entities).length > 0 && executing == EXECUTING.NONE)}
                    >
                        {bulkEditData.filter((d) => d.saved_id).length > 0 && (<>{t('更新')}</>) || (<>{t('保存')}</>)}
                    </button>

                    <button
                        onClick={csvExport}
                        className="button secondary"
                        disabled={! (bulkEditData.filter((d) => Object.keys(d.editData).length > 0).length > 0)}
                    >
                        CSV Export
                    </button>
                </>)}
                {/*} 
                <span>
                {'※試用版につき、扱えるファイルは ' + MAX_FILE_NUM + ' までにしています。'}
                </span>
                */}
            </div>
        </section>

        <section>
            <div className="content">
                {bulkEditData.map((data, index) =>(<div className="row">
                    <Form
                        imageData={data.imageData}
                        ocrText={data.ocrText ? data.ocrText : ''}
                        entities={data.entities ? data.entities : []}
                        editData={data.editData}
                        setEditData={(d) => updateEditData(index, d)}
                        labels={labels}
                        executing={
                            (executing == EXECUTING.OCR && !data.ocrText) && t('OCR実行中') || 
                            (executing == EXECUTING.LABEL && !data.entities) && t('ラベリング実行中') || 
                            (executing == EXECUTING.SAVE && !data.saved_id) && t('保存中') || 
                            (executing == EXECUTING.UPDATE && !data.saved) && t('更新中') ||
                            false
                        }
                    />
                </div>))}
            </div>
        </section>
    </BasicLayout>);
};
export default Bulk;