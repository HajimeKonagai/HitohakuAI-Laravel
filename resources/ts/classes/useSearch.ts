import { useState, useEffect } from 'react';
import { useQueryClient } from 'react-query';
import queryString from 'query-string';
import { useIndex } from '@/classes/api';

declare var route;

const useSearch = ({
    currentRoute,
    apiRoute,
}) =>
{
	const queryClient = useQueryClient();
    const parsed = queryString.parse(location.search, {arrayFormat: 'index'});
    const [ searchParams, setSearchParams ] = useState(parsed);
	const results = useIndex(route(apiRoute), searchParams);

    useEffect(() =>
    {
        const stringifyed = queryString.stringify(searchParams, {arrayFormat: 'index'});
        history.replaceState(null, null, route(currentRoute) +
            (stringifyed != '' ? '?' + stringifyed : ''))
    }, [searchParams])

    return {
        queryClient,
        searchParams,
        setSearchParams,
        results,
    }
}
export default useSearch;