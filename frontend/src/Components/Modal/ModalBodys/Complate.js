import {IoCheckmarkCircleOutline} from 'react-icons/io5'
import { useTranslation } from 'react-i18next';

function Complate({toggleModal, approveFunction, headerText, title}) {
    const {t} = useTranslation(['common'])
    return (
        <div className={'modalContent text-center'}>
            <div className='flex items-center justify-center'>
                <IoCheckmarkCircleOutline
                    className={'modalIcon text-primary-800'}
                    size={'6rem'}
                />
            </div>
            <p className={'text-[1.125rem] text-black-700 font-medium mt-5'}>
                {t(headerText)}
            </p>
            <p className={'text-black-700 font-light mt-3 text-[0.8rem]'}>
                {t(title)}
            </p>
            <div
                className={'flex mt-7 items-center justify-center gap-[1.5rem]'}
            >
                <button
                    className={'approveBtn bg-black-500 hover:bg-black-700'}
                    onClick={toggleModal}
                >
                    {t("Bekor qilish")}
                </button>
                <button
                    className={'approveBtn bg-primary-800 hover:bg-primary-900'}
                    onClick={approveFunction}
                >
                    {t("Tasdiqlash")}
                </button>
            </div>
        </div>
    )
}

export default Complate
