import { Box, H1, Image, Text } from "@mercury-js/mess";
import React from "react";

export default function Cards() {

    const cardData = [
        {
            id: 1,
            icon: "assets/EmployeesIcon.png",
            title: "Employees",
            count: "254",
            values1: "205+",
            values2: "Check-In’s",
            color: "#FF8100"
        },
        {
            id: 2,
            icon: "assets/SalesIcon.png",
            title: "Sales",
            count: "₹24,325",
            values1: "10%+",
            values2: "Per Month",
            color: "#318DE3"

        },
        {
            id: 3,
            icon: "assets/PurchasesIcon.png",
            title: "Purchases",
            count: "254",
            values1: "10%+",
            values2: "Per Month",
            color: "#03BE3B"

        },
        {
            id: 4,
            icon: "assets/ExpensesIcon.png",
            title: "Expenses",
            count: "₹4,325",
            values1: "5%",
            values2: "Saved",
            color: "#8158E5"
        }
    ]

    console.log(cardData, "cardData");

    return (
        <Box styles={{
            base: `
            display:flex;
            flex-wrap: wrap;
flex-direction: row; 
            gap:12.46px;`

        }}>
            {cardData.map((card) => (
                <Box key={card.id} styles={{
                    base: `
                    border:1px solid #DDDDDD;
                    border-radius:19.93px;
                    padding:16.19px 28.65px;
                    width:310px;
                    `
                }}>
                    <Box styles={{
                        base: {
                            display: "flex",
                            flexDirection: "column",
                            gap: "10px",
                        }
                    }}>
                        <Image src={card.icon} alt="icon" styles={{
                            base: `
    width:30px;
    height:30px;
    `
                        }} />
                        <Box styles={{
                        base: {
                            display: "flex",
                            flexDirection: "column",
                        }
                    }}>
                            <H1 styles={{
                                base: `
    font-size:18.68px;
    font-weight:400;
    `}}>
                                {card.title}
                            </H1>
                            <H1 styles={{
                                base: `
    font-size:32px;
    font-weight:600;
    `}}>
                                {card.count}
                            </H1>

                            <H1 styles={{
                                base: `
    font-size:18.68px;
    font-weight:400;
     display:flex;
flex-direction: row; 
color:${card.color}
    `}}>
                                {card.values1}
                                <Text styles={{
                                    base: `
        color:black;
        `
                                }}>{card.values2}</Text>
                            </H1>
                        </Box>
                    </Box>
                </Box>
            ))}


        </Box>
    )
}