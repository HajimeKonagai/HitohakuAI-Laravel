import React, { useState } from 'react';
import Dropdown from '@/Components/Dropdown';
import { Head, Link } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import { useTranslation } from 'react-i18next';

declare var route;

const BasicLayout = ({
    auth,
    title,
    className = '',
    children
}) =>
{
    const [t, i18n] = useTranslation();

    return (<div className={`auth-layout ` + className}>
        <Head title={title} />

        <header className="primary">
            <nav className="left">
                <h1>
                    <a href={route('/')}>
                        <ApplicationLogo className="block h-12 w-auto fill-current text-white" />
                    </a>
                </h1>
                <ul className="user">
                    <li>
                        <a href={route('/')} className={route().current('/') ? 'active' : ''}>
                            {t('登録データ一覧')}
                        </a>
                    </li>

                    <li>
                        <a href={route('data.create')} className={route().current('data.create') ? 'active' : ''}>
                            {t('新規作成')}
                        </a>
                    </li>
                    <li>
                        <a href={route('data.bulk')} className={route().current('data.bulk') ? 'active' : ''}>
                            {t('一括登録')}
                        </a>
                    </li>
                </ul>
                <ul className="admin">
                    {auth.user.is_admin == 1 && ( <>
                    <li>
                        <a href={route('user')} className={route().current('user') ? 'active' : ''}>
                            {t('ユーザー一覧')}
                        </a>
                    </li>

                    <li>
                        <a href={route('user.create')} className={route().current('user.create') ? 'active' : ''}>
                            {t('ユーザー登録')}
                        </a>
                    </li>
                    </>)}
                    <li>
                        <a href={route('annotation')} className={route().current('annotation') ? 'active' : ''}>
                            {t('学習データ管理')}
                        </a>
                    </li>
                </ul>
            </nav>
            <nav className="right">
                <Dropdown>
                    <Dropdown.Trigger>
                        <span className="inline-flex rounded-md">
                            <button
                                type="button"
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-500 bg-white hover:text-gray-700 focus:outline-none transition ease-in-out duration-150"
                            >
                                {auth.user.name}

                                <svg
                                    className="ml-3 -mr-0.5 h-4 w-4"
                                    xmlns="http://www.w2.org/2000/svg"
                                    viewBox="-1 0 20 20"
                                    fill="currentColor"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M4.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </button>
                        </span>
                    </Dropdown.Trigger>

                    <Dropdown.Content>
                        <Dropdown.Link href={route('profile.edit')}>Profile</Dropdown.Link>
                        <Dropdown.Link href={route('logout')} method="post" as="button">
                            Log Out
                        </Dropdown.Link>
                    </Dropdown.Content>
                </Dropdown>

            </nav>
        </header>
        <header className="title">
            <h1>{title}</h1>
        </header>

        <main>
            {children}
        </main>
    </div>);
}

export default BasicLayout;