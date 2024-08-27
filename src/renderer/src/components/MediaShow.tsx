import { useEffect, useRef, useState } from 'react';
import style from '../assets/media.module.css'
import { TbCircuitPushbutton } from "react-icons/tb";
import { MediaPack, UsbPack } from '@shared/Types';
import { useLocation, useNavigate } from 'react-router-dom';

// Helper function to convert base64 to Blob
function base64ToBlob(base64: string, mimeType: string): Blob {
    const byteString = atob(base64);
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const uint8Array = new Uint8Array(arrayBuffer);

    for (let i = 0; i < byteString.length; i++) {
        uint8Array[i] = byteString.charCodeAt(i);
    }

    return new Blob([uint8Array], { type: mimeType });
};


export default function MediaShow() {
    const [media, setMedia] = useState<MediaPack>({ NAME: '', TYPE: '', PATH: '' })
    const Stop_readSlave = useRef<boolean>(false)
    const NewURL = useRef<string>('')
    const StartAPP = useRef<boolean>(true)
    const navigate = useNavigate();
    const location = useLocation();
    const message = location.state?.message;

    // read data return slave
    const HandleSerialSlave = ((data: UsbPack) => {
        let blob: Blob | null = null;
        console.log(data)

        if (['jpg', 'jpeg', 'png'].includes(data.TYPE)) {
            blob = base64ToBlob(data.BASE64, `image/${data.TYPE}`);
        } else if (['mp4', 'avi', 'mov'].includes(data.TYPE)) {
            blob = base64ToBlob(data.BASE64, `video/${data.TYPE}`);
        }

        if (blob) {
            //clean old URL
            if (NewURL.current) {
                URL.revokeObjectURL(NewURL.current);
            }
            setMedia({ NAME: '', PATH: '', TYPE: '' });
            // Create new URL from the Blob data
            NewURL.current = URL.createObjectURL(blob);

            // Update media state with new URL and other properties
            setMedia({
                NAME: data.NAME || 'unknown',
                TYPE: data.TYPE || '',
                PATH: NewURL.current,

            });

            console.log(`load ${data.NAME}`)

        } else {
            setMedia({
                NAME: data.NAME || 'unknown',
                TYPE: data.TYPE || '',
                PATH: '',
            });
            console.log('no image')
        }

        data = null
    })
    // finish media
    const FinishMedia = (() => navigate("/handle"))
    // start function
    const Start = async () => {
        // đăng kí hàm dọn dẹp
        Stop_readSlave.current = await window.api.slaveInit(message)
        //listener
        if (Stop_readSlave.current) {
            window.api.OnListener("load-media", HandleSerialSlave);
            window.api.OnListener("finish-media", FinishMedia);
            window.api.slaveFist(message);
        }
    }

    useEffect(() => {

        // start application
        if (StartAPP.current == true) {
            // cập nhật trang
            Start()
            // thay dữ liệu
            StartAPP.current = false
        }
        // xóa useEffect
        return () => {
            window.api.slaveDeinit()
            window.api.removeEvent("load-media", HandleSerialSlave);
            window.api.removeEvent("finish-media", FinishMedia);
            // CLEAN
            if (NewURL.current) URL.revokeObjectURL(NewURL.current);
            setMedia({ NAME: '', PATH: '', TYPE: '' });
        };
    }, [message, navigate])
    return (
        <>
            {['jpg', 'jpeg', 'png', 'gif'].includes(media.TYPE) && (
                <img style={{ width: '100%', height: '100%' }} src={media.PATH} alt="image" />
            )}
            {['mp4', 'avi', 'mov'].includes(media.TYPE) && (
                <video src={media.PATH} loop autoPlay muted style={{ width: '100%', height: '100%' }} />
            )}
            {media.TYPE === '' && (
                <div className={style.container}>
                    <TbCircuitPushbutton style={{ fontSize: '100px' }} />
                    <span>ẤN VÀ {media.NAME} ĐỂ QUA BƯỚC</span>
                </div>
            )}
        </>
    );
};