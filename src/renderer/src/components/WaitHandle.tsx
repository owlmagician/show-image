
import { useEffect, useRef, useState } from 'react';
import style from '../assets/handle.module.css'
import { GiFinishLine } from "react-icons/gi";
import { useLocation, useNavigate } from 'react-router-dom';

export default function WaitHandle() {
    const [title, setTitle] = useState<string>('ẤN MỘC ĐỂ HOÀN THÀNH KIỂM DÂY')
    const StartAPP = useRef<boolean>(true)
    const navigate = useNavigate();

    const Listener_Button = (data) => {
        // update state
        setTitle(data)
        console.log('finish')
        // chờ 50 ms trước khi về trang chính
        const timeoutId: NodeJS.Timeout = setTimeout(() => {
            navigate('/', { state: { message: `HOÀN THÀNH` } });
        }, 50);
    }
    useEffect(() => {
        // start application
        if (StartAPP.current) {
            window.api.finishInit()
            window.api.OnListener("finish-screen", Listener_Button);
            StartAPP.current = false
        }
        return () => {
            window.api.removeEvent("finish-screen", Listener_Button);
        }
    }, [navigate])
    return (
        <div
            className={style.container}
        >
            <GiFinishLine style={{ fontSize: '200px', marginBottom: '10px' }} />
            {title}
        </div>
    );
};