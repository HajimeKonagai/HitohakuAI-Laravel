import { useTranslation } from 'react-i18next';

const RenderAnnotation = ({
    selectTextId,
    text,
    entities,
    labels
}) =>
{
    const [t, i18n] = useTranslation();

    const sections = [];
    let pos = 0;

    entities.sort((a, b) => {
        return a.span[0] - b.span[0]
    });

    entities.map((entity) => {
        sections.push(<>{text.substring(pos, entity.span[0])}</>);
        sections.push(
            <span class={`${entity.label} annotation-text`}>
                <span className={`${entity.label} annotation-label`}>{t(labels[entity.label].name)}</span>
                {text.substring(entity.span[0], entity.span[1])}
            </span>
        )
        pos = entity.span[1]
    })
    sections.push(<>{text.substring(pos)}</>)
    return (<div className="render-annotation">
        <div id={selectTextId} className="select-text z-10">
            {text}
        </div>
        <div className="annotation-text z-0">
            {sections.map((section) => (<>{section}</>))}
        </div> 
    </div>);
}

export default RenderAnnotation;