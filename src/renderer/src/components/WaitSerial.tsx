import { Input } from "@mantine/core";
import style from "../assets/serial.module.css"
import { useEffect, useRef } from "react";
import { BarcodeStruct } from "@shared/Types";
import { useLocation, useNavigate } from "react-router-dom";

export default function WaitSerial() {

    const Input_ref = useRef<HTMLInputElement>(null);
    const Span_ref = useRef<HTMLSpanElement>(null);
    const StartAPP = useRef<boolean>(true)
    const Stop_readSerial = useRef<boolean>(false);
    const navigate = useNavigate();
    const location = useLocation();
    const message = location.state?.message;

    // Function to update span element
    const updateSpan = (message: string, isSuccess: boolean) => {
        if (Span_ref.current) {
            Span_ref.current.style.color = isSuccess ? 'green' : 'red';
            Span_ref.current.textContent = message;
        }
    };
    // Function to handle barcode data
    const handleBarcodeData = (data: BarcodeStruct) => {
        console.log(data)
        if (Input_ref.current) {
            Input_ref.current.value = data.NAME;
        }
        if (data.RESULT) {
            navigate("/media", { state: { message: data.NAME } });
        } else {
            updateSpan(data.NOTIFICATION, false);
        }
    };

    useEffect(() => {
        const Start = async () => {
            Stop_readSerial.current = await window.api.barcodeInit()
            //listener
            if (Stop_readSerial.current){
                window.api.OnListener("return-barcode", handleBarcodeData)
                console.log('start listened')
            }
        }

        if (StartAPP.current == true) {
            // kiểm tra kết quả trả về từ các page khác
            if (message === 'HOÀN THÀNH') updateSpan(message, true);
            else updateSpan(message, false);
            // cập nhật trang
            Start()
            // thay dữ liệu
            StartAPP.current = false
        }

        // xóa useEffect
        return () => {
            window.api.removeEvent("return-barcode", handleBarcodeData);

        };
    }, [message, navigate])

    return (
        <div className={style.container}>

            <h1 style={{ color: 'green' }}>  SHOW-IMAGE  </h1>
            <Input
                ref={Input_ref}
                classNames={{ wrapper: style.Input_wrapper }}
                placeholder="vui lòng đọc Barcode"

            />
            <span
                ref={Span_ref}
                style={{ marginTop: '10px' }}
            >
                Xin Chào
            </span>

        </div>
    );
};
