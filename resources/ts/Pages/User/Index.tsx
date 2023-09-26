import React, { useState, useEffect } from 'react';
import BasicLayout from '@/Layouts/BasicLayout';
import useSearch from '@/classes/useSearch';
import Pagination from '@/Components/Pagination';

declare var route;


const Index = ({
    auth,
    errors,
}) =>
{
    const { searchParams, setSearchParams, results } = useSearch({
        currentRoute: 'user', 
        apiRoute: 'api.user.search',
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

    return (<BasicLayout
        auth={auth}
        title='ユーザー一覧'
        className="user index"
    >
        <section>
            <h1>一覧</h1>
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
                                    <th>ID</th>
                                    <th>管理者</th>
                                    <th>ユーザー名</th>
                                    <th>メールアドレス</th>
                                    <th>登録日</th>
                                    <th>作成済みデータ件数</th>
                                    <th>操作</th>
                                </tr>
                            </thead>
                            <tbody style={{miHeight:'900px'}}>
                                {data.data.map((d) => (
                                <tr key={d.id}>
                                    <th className="2-1/8">{d.id}</th>
                                    <th className="2-1/8">
                                        {d.is_admin && (<span className="text-sm text-white bg-red-600 rounded p-1">管理ユーザー</span>) || (<></>)}
                                    </th>
                                    <td className="w-2/8 text-center">{d.name}</td>
                                    <td className="w-2/8 text-center">{d.email}</td>
                                    <td className="w-2/8 text-center">{d.created_str}</td>
                                    <td className="w-2/8 text-center">{d.data.length}</td>
                                    <th className="w-2/8 text-center">
                                        <a className="button" href={route('user.edit', {'user': d.id})}>編集</a>
                                    </th>
                                </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <th>ID</th>
                                    <th>管理者</th>
                                    <th>ユーザー名</th>
                                    <th>メールアドレス</th>
                                    <th>登録日</th>
                                    <th>作成済みデータ件数</th>
                                    <th>操作</th>
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

    </BasicLayout>);
}

export default Index;