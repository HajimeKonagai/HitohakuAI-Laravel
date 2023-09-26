import React from 'react';
import queryString from 'query-string';

const Pagination = ({
    data,
    setSearchParams
}) =>
{
    return (<nav className="pagination">
        <ul>
        {data.links.map((link) => (
            <li className={`${link.active ? 'active' : ''} ${link.url ? '' : 'disabled'}`} key={link.label}>
            {link.url && (
                <a
                    href={link.url}
                    onClick={(e) => {
                        e.preventDefault();
                        setSearchParams(queryString.parse(new URL(link.url).search, {arrayFormat: 'index'}))
                    }}
                >
                    <span dangerouslySetInnerHTML={{ __html: link.label}} />
                </a>
            ) || (
                <span dangerouslySetInnerHTML={{ __html: link.label}} />
            )}
            </li>
        ))}
        </ul>
        <span className="total"><small>全</small>{data.total}<small>件</small></span>
    </nav>)
}

export default Pagination;