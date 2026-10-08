import { useContext, useState } from "react";

import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";


import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

import { createTheme, ThemeProvider } from "@mui/material/styles";

import Snackbar from "@mui/material/Snackbar";

import { AuthContext } from "../contexts/AuthContext";

const defaultTheme = createTheme();


export default function Authentication() {

    const [name, setName] = useState("");

    const [username, setUsername] = useState("");

    const [password, setPassword] = useState("");

    const [error, setError] = useState("");

    const [message, setMessage] = useState("");

    const [formState, setFormState] = useState(0);

    const [open, setOpen] = useState(false);

    const { handleRegister, handleLogin } = useContext(AuthContext);

    const handleAuth = async () => {

        try {

            if (formState === 0) {

                const result = await handleLogin(username, password);

                console.log(result);
                setMessage(result);
                setOpen(true);
                setPassword("");
                setUsername("");
                setName("");
                setError("");
            }

            else {

                const result = await handleRegister(name, username, password);

                console.log(result);

                setMessage(result);

                setOpen(true);

                setError("");

                setFormState(0);

                setPassword("");

                setUsername("");

                setName("");
            }

        }

        catch (err) {

            const errorMessage = err.response?.data?.message || "Something went wrong";

            setError(errorMessage);
        }
    };



    return (


        <ThemeProvider theme={defaultTheme}>

            <Grid
                container
                component="main"
                sx={{
                    height: "100vh"
                }}
            >
                <CssBaseline />

                <Grid
                    size={{
                        xs: 12,
                        sm: 4,
                        md: 7
                    }}

                    sx={{
                      
                        backgroundImage:
                            "url('https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80')",

                   
                        backgroundRepeat: "no-repeat",

                        backgroundSize: "cover",

                        backgroundPosition: "center"
                    }}
                />

                <Grid
                    size={{
                        xs: 12,
                        sm: 8,
                        md: 5
                    }}

                    component={Paper}

                    elevation={6}

                    square
                >

                    <Box
                        sx={{
                            my: 8,

                            mx: 4,

                            display: "flex",

                            flexDirection: "column",

                            alignItems: "center"
                        }}
                    >

                        <Avatar
                            sx={{
                                margin: 1,

                                bgcolor: "secondary.main"
                            }}
                        >
                            <LockOutlinedIcon />
                        </Avatar>

                        <div>

                            <Button
                                variant={ formState === 0 ? "contained" : "outlined" }

                                onClick={() => {
                                    setFormState(0);
                                    setError("");
                                }}
                            >
                                Sign In
                            </Button>

                            <Button
                                variant={ formState === 1 ? "contained" : "outlined" } onClick={() => { setFormState(1); setError(""); }}
                            >
                                Sign Up
                            </Button>

                        </div>

                        <Box
                            component="form"

                            noValidate

                            sx={{
                                mt: 1
                            }}
                        >


                            

                            {formState === 1 && (

                                <TextField

                                    margin="normal"

                                    required

                                    fullWidth

                                    id="name"

                                    label="Full Name"

                                    name="name"

                                    value={name}

                                    autoFocus

                                    onChange={(event) => {

                                        setName(event.target.value);

                                    }}
                                />

                            )}


                            <TextField

                                margin="normal"

                                required

                                fullWidth

                                id="username"

                                label="Username"

                                name="username"

                                value={username}

                                autoFocus

                                onChange={(event) => {

                                    setUsername(
                                        event.target.value
                                    );

                                }}
                            />

                            <TextField

                                margin="normal"

                                required

                                fullWidth

                                id="password"

                                label="Password"

                                name="password"

                                type="password"

                                value={password}

                                onChange={(event) => {

                                    setPassword(
                                        event.target.value
                                    );

                                }}
                            />

                            {error && (

                                <p
                                    style={{
                                        color: "red"
                                    }}
                                >
                                    {error}
                                </p>

                            )}

                            <Button

                                type="button"

                                fullWidth

                                variant="contained"

                                sx={{
                                    mt: 3,
                                    mb: 2
                                }}

                                onClick={handleAuth}
                            >

                                {formState === 0
                                    ? "Login"
                                    : "Register"}

                            </Button>


                        </Box>

                    </Box>

                </Grid>

            </Grid>

            <Snackbar

                open={open}

     
                autoHideDuration={4000}


                onClose={() => {
                    setOpen(false);
                }}

                message={message}
            />

        </ThemeProvider>
    );
}

