export const ReportsTableHeaders = (header) => {
    let paymenttype =
        (header === 'cash' && 'Naqt') ||
        (header === 'card' && 'Plastik') ||
        (header === 'transfer' && "O'tkazma")

    const headers = {
        sale: [
            {
                title: '№',
            },
            {
                title: 'Sana',
                filter: 'createdAt',
            },
            {
                title: 'ID',
                filter: 'saleconnector.id',
            },
            {
                title: 'Mijoz',
                filter: 'client',
            },
            {
                title: 'Sotuv',
            },
            {
                title: 'Naqt',
            },
            {
                title: 'Plastic',
            },
            {
                title: "O'tkazma",
            },
            {
                title: '',
            },
        ],
        income: [
            {
                title: '№',
            },
            {
                title: 'Sana',
                filter: 'createdAt',
            },
            {
                title: 'ID',
                filter: 'saleconnector.id',
            },
            {
                title: 'Kelgan narxi',
            },
            {
                title: 'Sotilgan narxi',
            },
            {
                title: 'Chegirma',
            },
            {
                title: 'Foyda',
            },
        ],
        debts: [
            {
                title: '№',
            },
            {
                title: 'Sana',
                filter: 'createdAt',
            },
            {
                title: 'ID',
                filter: 'saleconnector.id',
            },
            {
                title: 'Mijoz',
                filter: 'client',
            },
            {
                title: 'Qarz izoh',
            },
            {
                title: 'Jami',
            },
            {
                title: 'Qarz',
            },
            {
                title: '',
            },
        ],
        expenses: [
            {
                title: '№',
            },
            {
                title: 'Sana',
                filter: 'createdAt',
            },
            {
                title: 'Summa',
            },
            {
                title: 'Izoh',
            },
            {
                title: 'Turi',
            },
        ],
        discounts: [
            {
                title: '№',
            },
            {
                title: 'Sana',
                filter: 'createdAt',
            },
            {
                title: 'ID',
                filter: 'saleconnector.id',
            },
            {
                title: 'Mijoz',
                filter: 'client',
            },
            {
                title: 'Jami',
            },
            {
                title: 'Chegirma',
            },
            {
                title: 'Foiz',
            },
        ],
        backproducts: [
            {
                title: '№',
            },
            {
                title: 'Sana',
                filter: 'createdAt',
            },
            {
                title: 'ID',
                filter: 'saleconnector.id',
            },
            {
                title: 'Mijoz',
                filter: 'client',
            },
            {
                title: 'Soni',
            },
            {
                title: 'Jami',
            },
            {
                title: 'Qaytarilgan',
            },
            {
                title: '',
            },
        ],
        payments: [
            {
                title: '№',
            },
            {
                title: 'Sana',
                filter: 'createdAt',
            },
            {
                title: 'ID',
                filter: 'saleconnector.id',
            },
            {
                title: 'Mijoz',
                filter: 'client',
            },
            {
                title: 'Sotuv',
            },
            {
                title: paymenttype,
            },
        ],
    }

    return header === 'cash' || header === 'card' || header === 'transfer'
        ? headers.payments
        : headers[`${header}`]
}
