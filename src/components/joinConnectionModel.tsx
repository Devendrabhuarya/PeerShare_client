'use client'
import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import CloseIcon from '@mui/icons-material/Close';
import { NextPage } from 'next';
import { useSocket } from '@/context/socketProvider';

interface HomeProps {
    setShowModel: () => void; // Declare the type of your prop
}

const JoinConnectionModel: NextPage<HomeProps> = ({ setShowModel }) => {
    const socket = useSocket();
    const [inputData, setInputData] = useState({
        name: '',
        roomId: '',
    });
    const inputField = [
        {
            lable: 'Name',
            id: 'name',
            placeholder: 'Enter your name'
        },
        {
            lable: 'Room-Id',
            id: 'roomId',
            placeholder: 'Enter Room-Id'
        }
    ];

    const handleOnChange = (e: any) => {
        setInputData({ ...inputData, [e.target.name]: e.target.value });
    }

    const handleOnSubmit = async () => {
        if (inputData.name === '' || inputData.roomId === '') {
            toast('Please fill the all field!', {
                icon: '🤓',
            });
            return false;
        }
        console.log(inputData);
        setInputData({
            name: '',
            roomId: '',
        });
    }
    return (
        <div className='h-screen text-primary  top-0 w-full flex justify-center  items-center  '
            style={{ position: 'absolute', background: 'rgb(0,0,0,0.5)' }}>

            <div className='relative cursor-pointer bg-secendary rounded-3xl'>
        
                <div className='bg-secendary  px-10 py-8  rounded-3xl md:px-5'
                    style={{ padding: '60px' }} >
                                <span
                    onClick={setShowModel}
                    style={{
                        position: 'absolute', top: '5px', right: '8px',

                    }}

                >
                    <CloseIcon className='text-3xl' />
                </span>
                    {inputField.map((val, ind) => (
                        <div className="inputs flex flex-col mt-3 text-start " key={ind}>
                            <label htmlFor={val.id} className=' font-serif font-light'>{val.lable}</label>
                            <input type="text" id={val.id} placeholder={val.placeholder}
                                value={val.id === 'name' ? inputData.name : inputData.roomId}
                                name={val.id}
                                title='warning'
                                className='h-16 bg-third  font-serif text-secendary border-2 focus:border-secendary w-96 rounded-md md:w-64  md:h-10'
                                onChange={handleOnChange} />
                        </div>
                    ))

                    }

                    <div className='text-center'>
                        <button className='px-20 mt-10 mx-auto  font-bold  py-2 rounded-3xl text-secendary bg-primary'
                            onClick={handleOnSubmit}>Join Room</button>
                    </div>
                </div>
            </div>

        </div>

    );
}

export default JoinConnectionModel;