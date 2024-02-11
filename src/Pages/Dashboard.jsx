import React from 'react'
import '../Style/dashboard.css'
import axios from 'axios'
import { useState, useEffect } from 'react'
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';


const Dashboard = () => {

  const apiUrl = process.env.REACT_APP_API_BASE_URL

  console.log(apiUrl);

  const [overallpurchasesales, Setoverallpurchasesales] = useState([])
  const [monthwisepurchasesales, Setmonthwisepurchasesales] = useState([])
  const [daywisepurchasesales, Setdaywisepurchasesales] = useState([])

  const tabeldatas = () => {
    try {
      axios.get(`${apiUrl}/overallpurchasesales`)
        .then((res) => {
          console.log(res.data);
          Setoverallpurchasesales(res.data)
        })
        .catch((err) => {
          console.log(err)

        })
      axios.get(`${apiUrl}/monthwisepurchasesales`)
        .then((res) => {
          console.log(res.data);
          Setmonthwisepurchasesales(res.data)
        })
        .catch((err) => {
          console.log(err)
        })
      axios.get(`${apiUrl}/daywisepurchasesales`)
        .then((res) => {
          console.log(res.data);
          Setdaywisepurchasesales(res.data)
        })
        .catch((err) => {
          console.log(err)
        })
    }
    catch (error) {
      console.log(error);
    }

  }

  useEffect(() => {
    tabeldatas()
  }, [])

  const columns = [
    {
      dataField: 'Sno',
      text: 'Sno'
    },
    {
      dataField: 'Suppliername',
      text: 'Suppliername'
    }, {
      dataField: 'productname',
      text: 'Product Name'
    }, {
      dataField: 'purchageqty',
      text: 'Purchage Quantity'
    },
    {
      dataField: 'SalesQty',
      text: 'Balance Quantity'
    },
    {
      dataField: 'BalanceQty',
      text: 'Sales Quantity'
    }

  ];

  function indication() {
    return "No data Present"
  }

  



  return (
    <div>

      <h3 style={{ borderRadius: '0.25em', textAlign: 'center', border: '1px solid purple', padding: '0.5em' }} className='mt-2 mb-4 top-1 bg-info-subtle '>Over All Sales</h3>
      <BootstrapTable
        keyField='id'
        data={overallpurchasesales}
        columns={columns}
        noDataIndication={indication}
        tabIndexCell
        wrapperClasses='outliner'
        hover
        pagination={ paginationFactory() }
      />


      <div className="row">
        <div className="col">
        <h3 style={{ borderRadius: '0.25em', textAlign: 'center',border: '1px solid purple', padding: '0.5em' }} className='mt-2 mb-4 top-2 bg-info-subtle'>Month Wise Sales</h3>
          <BootstrapTable
            keyField='id'
            data={monthwisepurchasesales}
            columns={columns}
            noDataIndication={indication}
            tabIndexCell
            pagination={ paginationFactory() }
            />
        </div>
        <div className="col">
        <h3 style={{ borderRadius: '0.25em', textAlign: 'center',  border: '1px solid purple', padding: '0.5em' }} className='mt-2 mb-4 top-3 bg-info-subtle'>Day Wise Sales</h3>
          <BootstrapTable
            keyField='id'
            data={daywisepurchasesales}
            columns={columns}
            noDataIndication={indication}
            tabIndexCell
            pagination={ paginationFactory() }
          />
        </div>
      </div>
    </div>
  )
}

export default Dashboard