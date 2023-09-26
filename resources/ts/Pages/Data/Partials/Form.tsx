import React, { useEffect, useState, useRef } from 'react';
import axios, { AxiosError } from 'axios';
import RenderAnnotation from '@/Components/RenderAnnotation';
import RenderImage from '@/Components/RenderImage';

import { useTranslation } from 'react-i18next';

declare var route;

const Form = ({
    imageData,
    ocrText,
    entities,
    editData,
    setEditData,
    labels,
    executing,
}) =>
{
    const [t, i18n] = useTranslation()
    // suggestion
    const [ suggestions, setSuggestions ] = useState({});
    const [ inputGroupEditing, setInputGroupEditing ] = useState('');
    const [ currentRef, setCurrentRef ] = useState(null);

    // update suggestion
    useEffect(() =>
    {
        if (editData.length < 1) return;
        if (currentRef) currentRef.current.focus();
		const timer = setTimeout(() =>
        {
            const formData = new FormData();
            formData.append('data', editData);
            axios.post(route('api.suggestion'), editData)
                .then((res) =>
                {
                    console.log(res);
                    setSuggestions(res.data);
                })
                .catch((e:AxiosError) =>
                {
                    console.log(e);
                })
                .finally(() =>
                {});
        }, 1000);
		return () => clearTimeout(timer)
    }, [ editData ]);


    const InputField = ({
        key,
        editing,
        setEditing,
        is_textarea = false,
    }) =>
    {
        const originals = entities.filter((entity) => entity.label == key);
        const inputRef = useRef();

        const inputElementClass = 'form-input-element';

        const inputValue = (value) =>
        {
            const newEditData = {...editData};
            newEditData[key] = value;
            setEditData(newEditData);
            // inputRef.current.focus();
        }
        const addValue = (value) =>
        {
            const newEditData = {...editData};
            newEditData[key] += value;
            setEditData(newEditData);
            // inputRef.current.focus();
        }

        
        return (<dl className="input-field">
            <dt><label>{t(labels[key].name)}</label></dt>
            <dd className="">

            {is_textarea && (
                <textarea
                    value={key in editData && editData[key] ? editData[key]: ''}
                    className={`${editing ? '': 'hide'} ${inputElementClass}`}
                    ref={inputRef}
                    type="text"
                    onChange={(e) => {
                        const newEditData = {...editData};
                        newEditData[key] = e.target.value;
                        setEditData(newEditData);
                    }}
                    onBlur={() => {
                        setTimeout(() => {
                            if (!document.activeElement.classList.contains(inputElementClass))
                            {
                                setInputGroupEditing('');
                                setCurrentRef(null);
                            }
                        }, 100);
                    }}
                    onFocus={() => {
                        setCurrentRef(inputRef)
                        setEditing();
                    }}
                />
            ) || (

                <input
                    value={key in editData && editData[key] ? editData[key]: ''}
                    className={`${editing ? '': 'hide'} ${inputElementClass}`}
                    ref={inputRef}
                    type="text"
                    onChange={(e) => {
                        const newEditData = {...editData};
                        newEditData[key] = e.target.value;
                        setEditData(newEditData);
                    }}
                    onBlur={() => {
                        setTimeout(() => {
                            if (!document.activeElement.classList.contains(inputElementClass))
                            {
                                setInputGroupEditing('');
                                setCurrentRef(null);
                            }
                        }, 100);
                    }}
                    onFocus={() => {
                        setCurrentRef(inputRef)
                        setEditing();
                    }}
                />
            )}

                {editing && (<>
                    <div className="original-text">
                    {originals.map((original) => (
                        <span className="">
                            <button className={`replace ${inputElementClass}`} onClick={(e) => inputValue(original.name)}>{original.name}</button>
                            <button className={`push ${inputElementClass}`} onClick={(e) => addValue(original.name)}>＋</button>
                        </span>
                    ))}
                    </div>
                </>)}
            </dd>
        </dl>);
    }

    return (<div className="form">

        {executing && (
            <div className="cover">
                {executing}
            </div>
        )}

        <div className="render">
            <RenderImage
                src={imageData}
                srcZoom={imageData}
            />
            <RenderAnnotation
                selectTextId='select-text'
                text={ocrText}
                entities={entities}
                labels={labels}
            />
        </div>

        <div className="form-groups">

            <div className="form-group extra">
                <h2>{t('データ編集用情報')}</h2>
                <div className="input">
                    <dl>
                        <dt><label>{t('識別用番号')}</label></dt>
                        <dd className="">
                            <input
                                value={'code' in editData ? editData['code']: ''}
                                type="text"
                                onChange={(e) => {
                                    const newEditData = {...editData};
                                    newEditData['code'] = e.target.value;
                                    setEditData(newEditData);
                                }}
                                onFocus={() => {
                                    setCurrentRef(null)
                                    setInputGroupEditing('');
                                }}
                            />
                        </dd>
                    </dl>
                </div>
            </div>
            <div className="form-group plant">
                <h2>{t('植物情報')}</h2>
                <div className="input">
                    {InputField({key: 'en_family', editing: inputGroupEditing == 'plant', setEditing: () => setInputGroupEditing('plant')})}
                    {InputField({key: 'ja_family', editing: inputGroupEditing == 'plant', setEditing: () => setInputGroupEditing('plant')})}
                    {InputField({key: 'en_name'  , editing: inputGroupEditing == 'plant', setEditing: () => setInputGroupEditing('plant')})}
                    {InputField({key: 'ja_name'  , editing: inputGroupEditing == 'plant', setEditing: () => setInputGroupEditing('plant')})}
                </div>
                {inputGroupEditing == 'plant' && 'plant' in suggestions && (
                    <div className="suggestion">
                        {suggestions['plant'].map((plant_suggest) => (
                            <button
                                className=""
                                onClick={() => {
                                    const newEditData = {...editData};
                                    newEditData['en_family'] = plant_suggest['en_family'];
                                    newEditData['ja_family'] = plant_suggest['ja_family'];
                                    newEditData['en_name'] = plant_suggest['en_name'];
                                    newEditData['ja_name'] = plant_suggest['ja_name'];
                                    setEditData(newEditData);
                                }}
                            >
                                <span>
                                    {plant_suggest.ja_name}
                                    ({plant_suggest.en_name})
                                </span>
                            </button>
                        ))}
                </div>)}
            </div>

            <div className="form-group address">
                <h2>{t('採取場所情報')}</h2>
                <div className="input">
                    {InputField({ key: 'ja_pref', editing: inputGroupEditing == 'address', setEditing: () => setInputGroupEditing('address')})}
                    {InputField({ key: 'ja_city', editing: inputGroupEditing == 'address', setEditing: () => setInputGroupEditing('address')})}
                    {InputField({ key: 'ja_addr', editing: inputGroupEditing == 'address', setEditing: () => setInputGroupEditing('address')})}
                    {InputField({ key: 'en_pref', editing: inputGroupEditing == 'address', setEditing: () => setInputGroupEditing('address')})}
                    {InputField({ key: 'en_city', editing: inputGroupEditing == 'address', setEditing: () => setInputGroupEditing('address')})}
                    {InputField({ key: 'en_addr', editing: inputGroupEditing == 'address', setEditing: () => setInputGroupEditing('address')})}
                    {InputField({ key: 'country', editing: inputGroupEditing == 'address', setEditing: () => setInputGroupEditing('address')})}
                </div>
                {inputGroupEditing == 'address' && 'address' in suggestions && (
                    <div className="suggestion">
                        {suggestions['address'].map((address_suggest) => (
                            <button
                                className=""
                                onClick={() => {
                                    const newEditData = {...editData};
                                    newEditData['ja_pref'] = address_suggest['ja_pref'];
                                    newEditData['en_pref'] = address_suggest['en_pref'];
                                    newEditData['ja_city'] = address_suggest['ja_city'];
                                    newEditData['en_city'] = address_suggest['en_city'];
                                    if ('ja_addr' in address_suggest) newEditData['ja_addr'] = address_suggest['ja_addr'];
                                    if ('en_addr' in address_suggest) newEditData['en_addr'] = address_suggest['en_addr'];
                                    // TODO: 今のところ全部「日本国」
                                    newEditData['country'] = '日本国';
                                    setEditData(newEditData);
                                }}
                            >
                                <span>
                                    {address_suggest.ja_pref}
                                    {address_suggest.ja_city}
                                    {'ja_addr' in address_suggest ? address_suggest.ja_addr: ''}
                                </span>
                            </button>
                        ))}
                </div>)}
            </div>

            <div className="form-group date">
                <h2>{t('日付・採取者・採取番号情報')}</h2>
                <div className="input">
                    {InputField({key: 'date', editing: inputGroupEditing == 'date', setEditing: () => setInputGroupEditing('date')})}
                    {InputField({key: 'person', editing: inputGroupEditing == 'date', setEditing: () => setInputGroupEditing('date')})}
                    {InputField({key: 'number', editing: inputGroupEditing == 'date', setEditing: () => setInputGroupEditing('date')})}
                </div>
                {inputGroupEditing == 'date' && 'date' in suggestions && (
                    <div className="suggestion">
                        <button
                            className=""
                            onClick={() => {
                                const newEditData = {...editData};
                                newEditData['date'] = suggestions['date'];
                                setEditData(newEditData);
                            }}
                        >
                            <span>
                                {suggestions.date}
                            </span>
                        </button>
                </div>)}
            </div>
        
            <div className="form-group location">
                <h2>{t('位置情報')}</h2>
                <div className="input">
                    {InputField({key: 'lat', editing: inputGroupEditing == 'location', setEditing: () => setInputGroupEditing('location')})}
                    {InputField({key: 'lng', editing: inputGroupEditing == 'location', setEditing: () => setInputGroupEditing('location')})}
                    {InputField({key: 'alt', editing: inputGroupEditing == 'location', setEditing: () => setInputGroupEditing('location')})}
                </div>
                {/*inputGroupEditing == 'date' && 'date' in suggestions && (
                    <div className="suggestion">
                        <button
                            className=""
                            onClick={() => {
                                const newEditData = {...editData};
                                newEditData['date'] = suggestions['date'];
                                setEditData(newEditData);
                            }}
                        >
                            <span>
                                {suggestions.date}
                            </span>
                        </button>
                        </div>)*/}
            </div>
            <div className="form-group memo">
                <h2>{t('備考')}</h2>
                <div className="input">
                    {InputField({key: 'memo'  , editing: inputGroupEditing == 'memo', setEditing: () => setInputGroupEditing('memo'), is_textarea: true})}
                </div>
                {/*inputGroupEditing == 'date' && 'date' in suggestions && (
                    <div className="suggestion">
                        <button
                            className=""
                            onClick={() => {
                                const newEditData = {...editData};
                                newEditData['date'] = suggestions['date'];
                                setEditData(newEditData);
                            }}
                        >
                            <span>
                                {suggestions.date}
                            </span>
                        </button>
                        </div>)*/}
            </div>


        </div>


    </div>);


}


export default Form;

