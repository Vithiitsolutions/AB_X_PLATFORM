import Mess, { Box, Button, Text } from '@mercury-js/mess';
import React, { useState } from 'react'
import { useTheme } from '../utils/theme';
import DynamicTable from '../components/table';
import PopUp from '../components/popup';
import { CustomeInput, CustomSelect } from '../components/inputs';
import DynamicForm from '../components/dynamicForm';

const dashboard = () => {
  const { theme } = useTheme();
  const [popupOpen,setPopupOpen]=useState(false)
  const onclosePopUp=()=>{
    setPopupOpen(false)
  }
  const data = [
    { customerName: "John Doe", email: "john@example.com", location: "New York", orders: 5, amountSpent: "$500" },
    { customerName: "Jane Smith", email: "jane@example.com", location: "LA", orders: 3, amountSpent: "$300" },
    { customerName: "John Doe", email: "john@example.com", location: "New York", orders: 5, amountSpent: "$500" },
    { customerName: "Jane Smith", email: "jane@example.com", location: "LA", orders: 3, amountSpent: "$300" }, { customerName: "John Doe", email: "john@example.com", location: "New York", orders: 5, amountSpent: "$500" },
    { customerName: "Jane Smith", email: "jane@example.com", location: "LA", orders: 3, amountSpent: "$300" }, { customerName: "John Doe", email: "john@example.com", location: "New York", orders: 5, amountSpent: "$500" },
    { customerName: "Jane Smith", email: "jane@example.com", location: "LA", orders: 3, amountSpent: "$300" }, { customerName: "John Doe", email: "john@example.com", location: "New York", orders: 5, amountSpent: "$500" },
    { customerName: "Jane Smith", email: "jane@example.com", location: "LA", orders: 3, amountSpent: "$300" }, { customerName: "John Doe", email: "john@example.com", location: "New York", orders: 5, amountSpent: "$500" },
    { customerName: "Jane Smith", email: "jane@example.com", location: "LA", orders: 3, amountSpent: "$300" },    { customerName: "John Doe", email: "john@example.com", location: "New York", orders: 5, amountSpent: "$500" },
    { customerName: "Jane Smith", email: "jane@example.com", location: "LA", orders: 3, amountSpent: "$300" },
    { customerName: "John Doe", email: "john@example.com", location: "New York", orders: 5, amountSpent: "$500" },
    { customerName: "Jane Smith", email: "jane@example.com", location: "LA", orders: 3, amountSpent: "$300" }, { customerName: "John Doe", email: "john@example.com", location: "New York", orders: 5, amountSpent: "$500" },
    { customerName: "Jane Smith", email: "jane@example.com", location: "LA", orders: 3, amountSpent: "$300" }, { customerName: "John Doe", email: "john@example.com", location: "New York", orders: 5, amountSpent: "$500" },
    { customerName: "Jane Smith", email: "jane@example.com", location: "LA", orders: 3, amountSpent: "$300" }, { customerName: "John Doe", email: "john@example.com", location: "New York", orders: 5, amountSpent: "$500" },
    { customerName: "Jane Smith", email: "jane@example.com", location: "LA", orders: 3, amountSpent: "$300" }, { customerName: "John Doe", email: "john@example.com", location: "New York", orders: 5, amountSpent: "$500" },
    { customerName: "Jane Smith", email: "jane@example.com", location: "LA", orders: 3, amountSpent: "$300" },    { customerName: "John Doe", email: "john@example.com", location: "New York", orders: 5, amountSpent: "$500" },
    { customerName: "Jane Smith", email: "jane@example.com", location: "LA", orders: 3, amountSpent: "$300" },
    { customerName: "John Doe", email: "john@example.com", location: "New York", orders: 5, amountSpent: "$500" },
    { customerName: "Jane Smith", email: "jane@example.com", location: "LA", orders: 3, amountSpent: "$300" }, { customerName: "John Doe", email: "john@example.com", location: "New York", orders: 5, amountSpent: "$500" },
    { customerName: "Jane Smith", email: "jane@example.com", location: "LA", orders: 3, amountSpent: "$300" }, { customerName: "John Doe", email: "john@example.com", location: "New York", orders: 5, amountSpent: "$500" },
    { customerName: "Jane Smith", email: "jane@example.com", location: "LA", orders: 3, amountSpent: "$300" }, { customerName: "John Doe", email: "john@example.com", location: "New York", orders: 5, amountSpent: "$500" },
    { customerName: "Jane Smith", email: "jane@example.com", location: "LA", orders: 3, amountSpent: "$300" }, { customerName: "John Doe", email: "john@example.com", location: "New York", orders: 5, amountSpent: "$500" },
    { customerName: "Jane Smith", email: "jane@example.com", location: "LA", orders: 3, amountSpent: "$300" },
    { customerName: "John Doe", email: "john@example.com", location: "New York", orders: 5, amountSpent: "$500" },
    { customerName: "Jane Smith", email: "jane@example.com", location: "LA", orders: 3, amountSpent: "$300" },
    { customerName: "John Doe", email: "john@example.com", location: "New York", orders: 5, amountSpent: "$500" },
    { customerName: "Jane Smith", email: "jane@example.com", location: "LA", orders: 3, amountSpent: "$300" }, { customerName: "John Doe", email: "john@example.com", location: "New York", orders: 5, amountSpent: "$500" },
    { customerName: "Jane Smith", email: "jane@example.com", location: "LA", orders: 3, amountSpent: "$300" }, { customerName: "John Doe", email: "john@example.com", location: "New York", orders: 5, amountSpent: "$500" },
    { customerName: "Jane Smith", email: "jane@example.com", location: "LA", orders: 3, amountSpent: "$300" }, { customerName: "John Doe", email: "john@example.com", location: "New York", orders: 5, amountSpent: "$500" },
    { customerName: "Jane Smith", email: "jane@example.com", location: "LA", orders: 3, amountSpent: "$300" }, { customerName: "John Doe", email: "john@example.com", location: "New York", orders: 5, amountSpent: "$500" },
    { customerName: "Jane Smith", email: "jane@example.com", location: "LA", orders: 3, amountSpent: "$300" },


  ];
  const options = [
    { label: "Option 1", value: "option1" },
    { label: "Option 2", value: "option2" },
    { label: "Option 3", value: "option3" },
  ];
  return (
    <Box
   
  >
<DynamicTable data={data} />
{/* <CustomeInput type='date' placeholder='' addonstyles={{base:{
  // height:"20px",
  // width:"20px",
}}}/> */}
{/* <CustomSelect options={options} placeholder='Select otion' addonstyles={{base:{
}}}/> */}
{/* <Button onClick={()=>    setPopupOpen(true)
}>Popup</Button> */}
<PopUp isOpen={popupOpen} onClose={onclosePopUp} ><DynamicTable data={data} />
</PopUp>
{/* <div><DynamicForm/></div> */}
<button
  className={Mess({
    styles: {
      base: {
        padding: "8px 10px",
        background: "#27A5C9",
        color: "black",
        borderRadius: "8px",
        border: "none",
      },
      lg: {
        padding: "10px 20px",
      },
    },
  })}
>
  button
</button>
<button className={Mess({ styles: "$buttonPrimary" })}>button</button>
  </Box>
  )
}

export default dashboard;