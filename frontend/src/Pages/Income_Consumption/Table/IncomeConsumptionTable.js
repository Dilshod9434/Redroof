import React from 'react'
import { useSelector } from 'react-redux'
import { roundUsd, roundUzs } from '../../../App/globalFunctions'

const IncomeConsumptionTable = ({ data }) => {
    const { currencyType } = useSelector((state) => state.currency)


    const filterData = () => {
        let dataLength = data[0].dailyIncomes.length
        let count = 0
        let filteredData = []

        while (count < dataLength) {
            let obj = {
                incomes: [],
            }
            data.forEach((item) => {
                obj.createdAt = item.dailyIncomes[count].createdAt
                obj.incomes.push(item.dailyIncomes[count])
            })
            console.log('work')
            filteredData.push(obj)
            count++
        }

        return filteredData
    }

    const datas = filterData()
    return (
        <table className='overflow-x-auto w-full'>
            <thead className='rounded-t-lg sticky top-0'>
                <tr className='bg-primary-900 rounded-t-lg'>
                    <th className='th'>
                        <div className='inline-flex items-center ml-1'>
                            Sana
                        </div>
                    </th>
                    {data.map((item, ind) => (
                        <th className='th' key={ind}>
                            <div className='inline-flex items-center ml-1'>
                                {item?.name}
                            </div>
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {datas &&
                    datas.map((item, ind) => (
                        <tr className='tr' key={ind}>
                            <td className='td py-[0.375rem] min-w-[100px]'>
                                {new Date(item.createdAt).toLocaleDateString()}
                            </td>
                            {item.incomes.map((el, ind) => (
                                <td
                                    className='td py-[0.375rem] min-w-[100px]'
                                    key={ind}
                                >
                                    {currencyType === 'USD'
                                        ? roundUsd(el?.totalprice)
                                        : roundUzs(el?.totalpriceuzs)}{' '}
                                    {currencyType}
                                </td>
                            ))}
                        </tr>
                    ))}
            </tbody>
            <tbody>
                <tr className='tr'>
                    <td className='td py-[0.375rem] min-w-[100px] font-bold'>Jami</td>
                    {data && data.map((el, ind) => (
                        <td key={ind} className='td py-[0.375rem] min-w-[100px] font-bold'>
                            {currencyType === 'USD' ? el?.dailyIncomes.reduce((prev, el) => prev + el.totalprice, 0) : el?.dailyIncomes.reduce((prev, el) => prev + el.totalpriceuzs, 0)} {currencyType}
                        </td>
                    ))}
                </tr>
            </tbody>
        </table>
    )
}

export default IncomeConsumptionTable
