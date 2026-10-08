
import React, { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom';

import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import HomeIcon from '@mui/icons-material/Home';
import AutoDeleteIcon from '@mui/icons-material/AutoDelete';
import IconButton from '@mui/material/IconButton';

export default function History() {

    const { getHistoryOfUser, deleteHistory } = useContext(AuthContext);

    const [meetings, setMeetings] = useState([]);

    const routeTo = useNavigate();

    useEffect(() => {

        const fetchHistory = async () => {

            try {

                const history = await getHistoryOfUser();

                setMeetings(history);

            } catch (error) {

                console.log(error);

            }
        }

        fetchHistory();

    }, []);


    // Date format karne ke liye
    let formatDate = (dateString) => {

        const date = new Date(dateString);

        const day = date.getDate()
            .toString()
            .padStart(2, "0");

        const month = (date.getMonth() + 1)
            .toString()
            .padStart(2, "0");

        const year = date.getFullYear();

        return `${day}/${month}/${year}`;
    }


    // Delete history
    const handleDelete = async (id) => {

        try {

            await deleteHistory(id);

            setMeetings((prevMeetings) =>
                prevMeetings.filter(
                    (meeting) => meeting._id !== id
                )
            );

        } catch (error) {

            console.log("Delete error:", error);

        }
    };


    return (
        <div>

            {/* Home button */}
            <IconButton
                onClick={() => {
                    routeTo("/home")
                }}
            >
                <HomeIcon />
            </IconButton>


            {
                meetings.length !== 0

                    ?

                    meetings.map((e) => {

                        return (

                            <Card
                                key={e._id}
                                variant="outlined"
                            >

                                <CardContent>

                                    <Typography
                                        sx={{ fontSize: 14 }}
                                        color="text.secondary"
                                        gutterBottom
                                    >
                                        Code: {e.meetingCode}
                                    </Typography>


                                    <Typography
                                        sx={{ mb: 1.5 }}
                                        color="text.secondary"
                                    >
                                        Date: {formatDate(e.date)}
                                    </Typography>


                                    {/* Delete button */}
                                    <IconButton
                                        color="error"
                                        onClick={() => handleDelete(e._id)}
                                    >
                                        <AutoDeleteIcon />
                                    </IconButton>

                                </CardContent>

                            </Card>
                        )
                    })

                    :

                    <Typography>
                        No meeting history
                    </Typography>
            }

        </div>
    )
}
