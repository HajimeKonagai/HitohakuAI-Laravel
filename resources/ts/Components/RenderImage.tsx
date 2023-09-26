import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';

declare var route;

const RenderImage = ({
    src,
    srcZoom,
    href=null
}) =>
{
    const [t, i18n] = useTranslation();

    const lensSize = 1200;
    const [ zoomAttach, setZoomAttach ] = useState(false);
    const [ zoom, setZoom ] = useState(false);
	const [ zoomXY, setZoomXY ] = useState([0,0]);
	const [ mouseXY, setMouseXY ] = useState([0,0]);
    const [ zoomPixel, setZoomPixel ] = useState(2500);

    const mouseMove = (e) =>
	{
        if (zoomAttach) return;
		const diff = lensSize/2;

		setZoomXY([
			fullImage.current.width * (e.nativeEvent.offsetX / e.target.clientWidth) * -1 + diff,
			fullImage.current.height * (e.nativeEvent.offsetY / e.target.clientHeight) * -1 + diff,
		]);

		setMouseXY([
			e.nativeEvent.offsetX - diff + e.target.offsetLeft,
			e.nativeEvent.offsetY - diff + e.target.offsetTop,
		]);
	}

	const fullImageBox = useRef();
	const fullImage = useRef();

    return (<div className="render-image">
        {href && (
            <a className="border rounded p-1" href={href} target="_blank">
                {t('新しいタブで開く')} 
            </a>
        )}
        <div className="image">
            <img
                
                src={src}
                onClick={() => setZoomAttach(!zoomAttach)}
                onMouseMove={mouseMove}
                onMouseEnter={() => setZoom(true)}
                onMouseLeave={() => {
                    if (!zoomAttach) setZoom(false);
                }}
            />
            <div
                className="lens_img_box"
                ref={fullImageBox}
                    style={{
                        left: mouseXY[0],
                        top: mouseXY[1],
                        width: lensSize,
                        height: lensSize,
                        opacity: zoom ? 1: 0,
                    }}
            >
                <img
                    src={srcZoom}
                    ref={fullImage}
                    style={{
                        left: zoomXY[0],
                        top: zoomXY[1],
                        maxWidth: zoomPixel.toString() + 'px',
                    }}
                    
                />
            </div>
        </div>
    </div>);
}

export default RenderImage;