import React from 'react';
import { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import axios from 'axios'
import BasicLayout from '@/Layouts/BasicLayout';
import { Head } from '@inertiajs/react';
import queryString from 'query-string';
import useSearch from '@/classes/useSearch';
import { useTranslation } from 'react-i18next';

declare var route;

const Index = ({
    auth,
    errors,
}) =>
{
    const [t, i18n] = useTranslation();

    const { searchParams, setSearchParams, results } = useSearch({
        currentRoute: 'annotation',
        apiRoute: 'api.annotation.search',
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
    if (data) console.log(data);

    const title = t('学習用ラベルデータ一覧')

    return (
        <BasicLayout
            auth={auth}
            title={title}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">{title}</h2>}
        >

            <section>
                <div className="content search">
                    <input
                        className="w-1/2"
                        name="code"
                        type="text"
                        value={'code' in searchValues? searchValues['code'] : ''}
                        onChange={ (e) => onChangeSearchValues(e, 'code') }
                        placeholder={t('識別用番号')}
                    />
                    <div className="inline-block pl-4 w-1/2">
                    {['0', '1', '2'].map((process) => (
                        <label className="mr-5">
                        <input
                            type="checkbox"
                            className=""
                            checked={'process' in searchValues && searchValues['process'].includes(process.toString()) ? searchValues['process'] : false}
                            onChange={(e) => {
                                const newSearchValues = {...searchValues};
                                if (! ('process' in searchValues)) newSearchValues['process'] = [];
                                if (e.target.checked)
                                {
                                    newSearchValues['process'].push(process.toString());
                                }
                                else
                                {
                                    newSearchValues['process'] = newSearchValues['process'].filter((item) => item != process.toString());
                                }
                                setSearchValues(newSearchValues)
                            }}
                        />
                            {process == '2' && (<span className="text-emerald-600">{t('作業済み')}</span>)}
                            {process == '1' && (<span className="bg-orange-600 text-white">{t('作業中')}</span>)}
                            {process == '0' && (<span className="text-gray-900">{t('未作業')}</span>)}
                        </label>
                    ))}
                    </div>
                    <input
                        className="w-full mt-2"
                        name="word"
                        type="text"
                        value={'word' in searchValues? searchValues['word'] : ''}
                        onChange={ (e) => onChangeSearchValues(e, 'word') }
                        placeholder={t('フリーワード検索')}
                    />
                </div>
            </section>

            <section>
                <div className="content min-h-max">
                {isLoading && (
                    <>Loading</>
                ) || (
                    <>
                        <div className="pagination">
                            {data.links.map((link) => (
                                <a className={`${link.active ? 'active' : ''} ${link.url ? '' : 'disabled'}`}
                                    href={link.url}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setSearchParams(queryString.parse(new URL(link.url).search, {arrayFormat: 'index'}))
                                    }}
                                >
                                    <span dangerouslySetInnerHTML={{ __html: link.label}} />
                                </a>
                            ))}
                            <span>Total: {data.total}</span>
                        </div>

                        <table>
                            <thead>
                                <tr>
                                    <th>{t('ID')}</th>
                                    <th>{t('作業プロセス')}</th>
                                    <th>{t('識別用番号')}</th>
                                    <th>{t('優先順位')}</th>
                                    <th>{t('ラベル数')}</th>
                                    <th>{t('操作')}</th>
                                </tr>
                            </thead>
                            <tbody style={{miHeight:'900px'}}>
                                {data.data.map((d) => (
                                <tr>
                                    <th className="2-1/8">{d.id}</th>
                                    <td className="w-1/8 text-center">
                                        {d.entity_edited_as_2 == 2 && (<span className="text-emerald-600">{t('作業済み')}</span>)}
                                        {d.entity_edited_as_2 == 1 && (<span className="bg-orange-600 text-white">{t('作業中')}</span>)}
                                        {d.entity_edited_as_2 == 0 && (<span className="text-gray-200">{t('未作業')}</span>)}
                                    </td>
                                    <td className="w-2/8 text-center">{d.code}</td>
                                    <td className="w-1/8 text-center">{d.priority}</td>
                                    <td className="w-1/8 text-center">{JSON.parse(d.entities) && JSON.parse(d.entities).length || 0}</td>
                                    <th className="w-2/8 text-center">
                                        <a className="button" href={route('annotation.edit', {'annotation': d.id})}>{t('編集')}</a>
                                    </th>
                                </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <th>{t('ID')}</th>
                                    <th>{t('作業プロセス')}</th>
                                    <th>{t('識別用番号')}</th>
                                    <th>{t('優先順位')}</th>
                                    <th>{t('ラベル数')}</th>
                                    <th>{t('操作')}</th>
                                </tr>
                            </tfoot>
                        </table>

                        <div className="pagination">
                            {data.links.map((link) => (
                                <a className={`${link.active ? 'active' : ''} ${link.url ? '' : 'disabled'}`}
                                    href={link.url}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setSearchParams(queryString.parse(new URL(link.url).search, {arrayFormat: 'index'}))
                                    }}
                                >
                                    <span dangerouslySetInnerHTML={{ __html: link.label}} />
                                </a>
                            ))}
                            <span>Total: {data.total}</span>
                        </div>
                        </>
                )}
                </div>
            </section>


        </BasicLayout>
    );
}

export default Index;