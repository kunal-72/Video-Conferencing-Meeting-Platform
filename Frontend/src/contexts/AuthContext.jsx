
import { createContext, useState } from "react";

import axios from "axios";

import { useNavigate } from "react-router-dom";

import { status as httpStatus } from "http-status";

export const AuthContext = createContext({});  

const client = axios.create({

    baseURL: "http://localhost:3000/api/v1/users/"
});

export const AuthProvider = ({ children }) => {    

    const [userData, setUserData] = useState({});

    const router = useNavigate();

    const handleRegister = async (name, username, password) => {

        try {


            const request = await client.post(
                "/register",
                {

        
                    name: name,

                  
                    username: username,

                    
                    password: password
                }
            );


           
            if (request.status === httpStatus.CREATED) {

         
                return request.data.message;
            }

        } catch (err) {

           
            throw err;
        }
    };



    const handleLogin = async (username, password) => {

        try {

            
            const request = await client.post( "/login", {

                    username: username,

         
                    password: password
                }
            );


            if (request.status === httpStatus.OK) {


                localStorage.setItem(
                    "token",
                    request.data.token
                );

                router("/home");

                return request.data.message;
            }

        } catch (err) {

            throw err;
        }
    };



    const getHistoryOfUser = async () => {
        try {
            let request = await client.get("/get_all_activity", {
                params: {
                    token: localStorage.getItem("token")
                }
            });
            return request.data;
        } catch
        (err) {
            throw err;
        }
    }

    
    const addToUserHistory = async (meetingCode) => {
        try {
            let request = await client.post("/add_to_activity", {
                token: localStorage.getItem("token"),
                meeting_code: meetingCode
            });
            return request
        } catch (e) {
            throw e;
        }
    }



    const deleteHistory = async (id) => {

        try {

            const request = await client.delete(
                "/delete_history",
                {
                    data: {
                        token: localStorage.getItem("token"),
                        id: id
                    }
                }
            );

            return request.data;

        } catch (e) {

            throw e;
        }
    };




 
    const data = {

  
        userData,

    
        setUserData,


        handleRegister,

   
        handleLogin,
        getHistoryOfUser,

        addToUserHistory,

        deleteHistory,
    };




    return (

        <AuthContext.Provider value={data}>


            {children}

        </AuthContext.Provider>
    );
};

