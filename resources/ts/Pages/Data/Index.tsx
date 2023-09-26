import React, { useState, useEffect } from 'react';
import { useQueryClient } from 'react-query';
import queryString from 'query-string';
import axios from 'axios';
import { useIndex, useStore, useUpdate, useDelete } from '@/classes/api';
import BasicLayout from '@/Layouts/BasicLayout';
import useSearch from '@/classes/useSearch';
import Pagination from '@/Components/Pagination';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

declare var route;

const Index = ({
    auth,
    labels
}) =>
{
    const [t, i18n] = useTranslation()
    const { searchParams, setSearchParams, results } = useSearch({
        currentRoute: '/', 
        apiRoute: 'api.data.search',
    });
    const { data, isLoading } = results;
    
    const [ searchValues, setSearchValues ] = useState(searchParams);    
    useEffect(() =>
    {
        const timer = setTimeout(() => {
            const newSearchParams = {...searchValues};
            setSearchParams(newSearchParams)
        }, 500);
		return () => clearTimeout(timer);
    }, [searchValues])
    
    const onChangeSearchValues = (e, key) =>
    {
        const newSearchValues = {...searchValues};
        e.target.value ?
            newSearchValues[key] = e.target.value :
            key in newSearchValues && delete newSearchValues[key];
        setSearchValues(newSearchValues)
    }




    const csvExport = async () =>
    {
        const stringifyed = queryString.stringify(searchParams, {arrayFormat: 'index'});
        const result = await axios.get(route('api.data.all' ), {
            params: searchParams,
        });

        if (!result || !result.data || result.data.length < 1)
        {
            toast.error('結果が0件です。');
        }

        const exportData:string[] = [];

        const header:string[] = [];
        header.push(t('識別用コード'));
        Object.keys(labels).map((key) =>
        {
            header.push(t(labels[key].name));
        });
        exportData.push('"' + header.join('","') + '"');

        result.data.map((d) =>
        {
            const arr:string[] = [];

            arr.push('code' in d && d['code'] ? d['code'].replace('"', '""') : '');
            Object.keys(labels).map((key) =>
            {
                if (key in d)
                {
                    const value = d[key] ? d[key] : '';
                    arr.push(value.replace('"', '""'));
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

	const queryClient = useQueryClient();

    const useDeleteData = useDelete({
        onSuccess: () =>
        {
            toast.success('削除しました');
            queryClient.invalidateQueries(route('api.data.search'));
        },
        onError: (error) =>
        {
            toast.error('失敗しました。');
        }
    });
    const deleteData = (d) =>
    {
        if(!confirm('削除してもよろしいですか？'))
        {
            return;
        }
        useDeleteData.mutate({
            url: route('api.data.delete', { data: d.id }),
        });
    }

    if (data) console.log(data);

    return (<BasicLayout
        auth={auth}
        title="登録データ一覧"
        className="data index"
    >
        <section className="search">
            <h1>{t('検索')}</h1>
            <div className="content">
                <dl className="text">
                    <dt>{t('テキストに一致')}</dt>
                    <dd>
                        <input
                            type="text"
                            value={'text' in searchValues? searchValues['text'] : ''}
                            onChange={ (e) => onChangeSearchValues(e, 'text') }
                            placeholder={t('テキストに一致')}
                        />
                    </dd>
                </dl>
                <dl className="label">
                <dt>{t('特定のラベルに一致')}</dt>
                    <dd>
                        <select
                            value={'label' in searchValues? searchValues['label'] : ''}
                            onChange={(e) => onChangeSearchValues(e, 'label')}
                        >
                            <option value=''></option>
                            {Object.keys(labels).map((label => (
                                <option value={label}>{labels[label].name}</option>
                            )))}
                        </select>

                        <input
                            type="text"
                            value={'value' in searchValues? searchValues['value'] : ''}
                            onChange={ (e) => onChangeSearchValues(e, 'value') }
                            placeholder={t('特定のラベルに一致')}
                        />

                    </dd>
                </dl>
                <dl className="date">
                    <dt>{t('登録日で期間検索')}</dt>
                    <dd>
                        <input
                            type="date"
                            value={'date_from' in searchValues? searchValues['date_from'] : ''}
                            onChange={ (e) => onChangeSearchValues(e, 'date_from') }
                        />
                        <span>～</span>
                        <input
                            type="date"
                            value={'date_to' in searchValues? searchValues['date_to'] : ''}
                            onChange={ (e) => onChangeSearchValues(e, 'date_to') }
                        />
                    </dd>
                </dl>
                <div className="reset">
                    <button className="button mr-4" onClick={csvExport}>{t('CSV エクスポート')}</button>
                    <button className="button secondary" onClick={() => setSearchValues({})}>{t('リセット')}</button>
                </div>
            </div>
        </section>

        <section>
            <h1>{t('一覧')}</h1>
            <div className="content">

                {isLoading && (
                    <>Loading..</>
                ) || (
                    <div className="table">
                        <Pagination
                            data={data}
                            setSearchParams={setSearchParams}
                        />
                        <table>
                            <thead>
                                <tr>
                                    <th>{t('識別用番号')}</th>
                                    <th>{t('欧名')}</th>
                                    <th>{t('和名')}</th>
                                    <th>{t('採集者')}</th>
                                    <th>{t('採集標本番号')}</th>
                                    <th></th>
                                    <th></th>
                                    <th></th>
                                    <th></th>
                                    <th className="w-48">{t('操作')}</th>
                                </tr>
                            </thead>
                            <tbody>
                            {data.data.map((d) => (
                                <tr key={d.id}>
                                    <td>{d.code}</td>
                                    <td>{d.en_name}</td>
                                    <td>{d.ja_name}</td>
                                    <td>{d.person}</td>
                                    <td>{d.number}</td>
                                    <td>{d.country}</td>
                                    <td>{d.ja_pref}</td>
                                    <td>{d.ja_city}</td>
                                    <td>{d.created_str}</td>
                                    <th className="flex justify-center">
                                        <a href={route('data.edit', { data: d.id })}
                                            className="button mr-2"
                                        >編集</a>
                                        <button className="button delete" onClick={(e) => deleteData(d)}>削除</button>
                                    </th>
                                </tr>
                            ))}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <th>{t('識別用番号')}</th>
                                    <th>{t('欧名')}</th>
                                    <th>{t('和名')}</th>
                                    <th>{t('採集者')}</th>
                                    <th>{t('採集標本番号')}</th>
                                    <th></th>
                                    <th></th>
                                    <th></th>
                                    <th></th>
                                    <th className="w-48">{t('操作')}</th>
                                </tr>
                            </tfoot>
                        </table>
                        <Pagination
                            data={data}
                            setSearchParams={setSearchParams}
                        />
                    </div>
                )}
            </div>
        </section>

    </BasicLayout>)
}
export default Index;