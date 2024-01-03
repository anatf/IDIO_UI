import React, { useEffect, useState } from 'react';
import "./InvoicesPage.css";
import axios from "axios";

const API_ADDRESS = "http://localhost:5115";
const InvoicesPage = (props) => {

  const [data, setData] = useState(null);
  const [transactions, setTransactions] = useState(null);
  const [refresh, setRefresh] = useState(false);

  // Function to force a refresh
  const forceRefresh = () => {
    setRefresh((prevRefresh) => !prevRefresh);
  };

  const [validValues, setValidValues] = useState([]);

  const validateAmount = (e) => {
    const inputValue = e.target.value;
    // Check if the input is a decimal number
  if (/^\d*\.?\d*$/.test(inputValue)) {
      setNumericInput(inputValue);
    }
  };

  useEffect(() => {
    // Fetch data from the API endpoint using Axios
    const fetchData = async () => {
      try {
        //const response = await request("get", "/api/Invoices", null);
        const response = await axios.get(API_ADDRESS + "/api/Invoices");
        if (response && response.data) {
          setData(response.data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } 
    };
  
    const fetchValidValues = async () => {
      try {
        const response = await axios.get(API_ADDRESS+"/api/Status");
        setValidValues(response.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchValidValues();
    fetchData();
  }, [data, refresh]); 

  const handleEdit = (id, field, value) => {

    if (field=="amount") {
      if (/^\d*\.?\d*$/.test(value)==false || value.trim()==="") {
        return;
      }
    }
    const updatedData = data.map((row) =>
      row.id === id ? { ...row, [field]: value } : row
    );
    setData(updatedData);
  };

  const handleLostFocus = (id, row) => {
    let dataEntry = data.find(item => item.id == id);


    let content = JSON.parse(JSON.stringify(dataEntry));
    axios.put(API_ADDRESS+"/api/Invoices/"+id, content);
  };

  const handleStatusChanged = (id, row, event) => {
    
    row.status = event.target.selectedIndex;
    let content = JSON.parse(JSON.stringify(row));
    axios.put(API_ADDRESS+"/api/Invoices/"+id, content);
    forceRefresh();
  };


  const [isModalOpen, setModalOpen] = useState(false);

  const openModal = () => {
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const addNewInvoice = (props) => {
     
    if (props.customer.trim() === '') {
      setValidationError('Customer cannot be empty');
      return;
    }
    else if (props.amount.trim() === '') {
      setValidationError('Amount cannot be empty');
      return;
    } else {
      setValidationError(null);
    }

      let newData = {id:0, amount:props.amount, customer:props.customer, status:1, timestamp:new Date().toISOString()};
      axios.post(API_ADDRESS+"/api/Invoices/", newData);
      closeModal();
      forceRefresh();
  };

  const showTransactions = (id) => {

    const fetchTransactions = async () => {
      try {
        //const response = await request("get", "/api/Invoices", null);
        const response = await axios.get(API_ADDRESS + "/api/InvoiceTransactionLogs/byInvoice/"+id);
        if (response && response.data) {
          setTransactions(response.data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    
    fetchTransactions();
  }

  const [amount, setNumericInput] = useState('');
  const [customer, setCustomer] = useState('');
  const [validationError, setValidationError] = useState(null);

  return (
    data &&
    <div>
       <div>
      <h1>Invoices</h1>
      <button onClick={openModal}>Create Invoice</button>

      {/* Render the modal directly in the same component */}
      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={closeModal}>&times;</span>
            <div>
      <h1>invoice</h1>
      <ul className="modal-table-view">
      <li>
          <span>Customer</span>
          <input type="text" id="customer" value={customer} onChange={(event) => { setCustomer(event.target.value); }}/>
        </li>
        <li>
          <span>Amount</span>
          <input type="text" id="amount" value={amount} onChange={validateAmount}/>
        </li>  
      </ul>
      
      <button onClick={() => addNewInvoice({ amount, customer })}>Just do it</button>
      {validationError && <div style={{ color: 'red' }}>{validationError}</div>}
    </div>
          </div>
        </div>
      )}
    </div>
   <div>
  
    </div>
      <table id="invoices">
        <thead>
          <tr>
            <th>ID</th>
            <th>Customer</th>
            <th>Status</th>
            <th>Amount</th>
            <th>Timestamp</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.id}>
              <td>{row.id}</td>
              <td>
                {row.customer}
              </td>
              <td>
              <div>
                  <select value={ validValues.find(item => item.id == row.status)?.description || null} onChange={(e) => handleStatusChanged(row.id, row, e)}>
                    <option value="" disabled>Select an option</option>
                    {validValues.map((value) => (
                      <option key={value.id} value={value.description}>
                        {value.description}
                      </option>
                    ))}
                  </select>
              
                </div>
              </td>
              <td>
                <input
                  type="text"
                  value={row.amount}
                  onChange={(e) => handleEdit(row.id, 'amount', e.target.value)}
                  onBlur ={(e) => handleLostFocus(row.id, row)}
                />
              </td>
              <td>
                {row.timestamp}
              </td>
              <td>
                <button onClick={() => showTransactions(row.id )}>Show transactions</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <br/>
      <h1>Transactions</h1>          
      <table id="transactions">
        <thead>
          <tr>
            <th>Transaction ID</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {transactions && transactions.map((row) => (
            <tr key={row.id}>
              <td>{row.id}</td>
              <td>{row.amount}</td>
              <td>{ validValues.find(item => item.id == row.status)?.description || null}</td>
              <td>{row.timestamp}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default InvoicesPage;