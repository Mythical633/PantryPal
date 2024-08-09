'use client';

import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { AppBar, Toolbar, Typography, Button, Box, Grid, Card, CardContent, TextField, IconButton } from '@mui/material';
import { auth, provider, signInWithPopup, signOut } from "@/firebase";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc, query, where } from "firebase/firestore";
import { firestore } from "@/firebase";
import ReactMarkdown from 'react-markdown';

// Create a theme with bluish accents
const theme = createTheme({
  typography: {
    fontFamily: 'Poppins, Arial, sans-serif',
    h4: {
      fontWeight: 700,
    },
    h6: {
      fontWeight: 600,
    },
    body1: {
      fontWeight: 400,
    },
    body2: {
      fontWeight: 400,
    },
  },
  palette: {
    primary: {
      main: '#1976d2', // Blue shade
    },
    secondary: {
      main: '#2196f3', // Light blue shade
    },
    background: {
      default: '#e3f2fd', // Light blue background
      paper: '#ffffff', // White background for cards
    },
    text: {
      primary: '#212121', // Dark text
      secondary: '#757575', // Lighter text
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8, // Rounded corners for buttons
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12, // Rounded corners for cards
        },
      },
    },
  },
});

export default function Home() {
  const [user, setUser] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [itemName, setItemName] = useState("");
  const [itemCount, setItemCount] = useState("");
  const [itemDate, setItemDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [hoveredItemId, setHoveredItemId] = useState(null);
  const [editingItemId, setEditingItemId] = useState(null);
  const [recipe, setRecipe] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
        updateInventory();
      } else {
        setUser(null);
        setInventory([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSignIn = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error signing in with Google: ", error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  const updateInventory = async () => {
    const collectionRef = collection(firestore, "inventory");
    const snapshot = await getDocs(collectionRef);
    const inventoryList = [];
    snapshot.forEach((doc) => {
      inventoryList.push({
        id: doc.id,
        ...doc.data(),
      });
    });
    setInventory(inventoryList);
  };

  const addItem = async () => {
    if (itemName.trim() === "" || itemCount.trim() === "") return;

    // Check if the expiration date is valid
    const today = new Date();
    const expirationDate = new Date(itemDate);
    if (expirationDate < today) {
      setErrorMessage("The expiration date cannot be in the past.");
      return;
    }

    setErrorMessage(""); // Clear previous error messages

    if (editingItemId) {
      const itemDocRef = doc(firestore, "inventory", editingItemId);
      await updateDoc(itemDocRef, {
        name: itemName,
        nameLowercase: itemName.toLowerCase(),
        count: parseInt(itemCount),
        date: itemDate,
      });
      setEditingItemId(null);
    } else {
      await addDoc(collection(firestore, "inventory"), {
        name: itemName,
        nameLowercase: itemName.toLowerCase(),
        count: parseInt(itemCount),
        date: itemDate,
      });
    }

    setItemName("");
    setItemCount("");
    setItemDate("");
    updateInventory();
  };

  const deleteItem = async (id) => {
    await deleteDoc(doc(firestore, "inventory", id));
    updateInventory();
  };

  const searchItems = async () => {
    if (searchTerm.trim() === "") {
      updateInventory();
      return;
    }

    const collectionRef = collection(firestore, "inventory");
    const q = query(collectionRef, where("nameLowercase", "==", searchTerm.toLowerCase()));
    const snapshot = await getDocs(q);
    const searchResults = [];
    snapshot.forEach((doc) => {
      searchResults.push({
        id: doc.id,
        ...doc.data(),
      });
    });
    setInventory(searchResults);
  };

  const startEdit = (item) => {
    setItemName(item.name);
    setItemCount(item.count.toString());
    setItemDate(item.date);
    setEditingItemId(item.id);
  };

  const generateRecipe = async () => {
    const itemNames = inventory.map(item => item.name).join(", ");
    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer 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`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          "model": "meta-llama/llama-3.1-8b-instruct:free",
          "messages": [
            { "role": "user", "content": `Generate a recipe using the following ingredients: ${itemNames}` },
          ],
        })
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      const data = await response.json();
      if (data.choices && Array.isArray(data.choices) && data.choices.length > 0) {
        const recipeContent = data.choices[0]?.message?.content || "";
        setRecipe(recipeContent);
      } else {
        setRecipe("No recipe generated.");
      }
    } catch (error) {
      console.error("Error generating recipe:", error);
      setRecipe("Failed to generate recipe. Please try again.");
    }
  };
  
  return (
    <ThemeProvider theme={theme}>
      <Head>
        <title>PantryGo</title>
      </Head>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            PantryGo
          </Typography>
          {user ? (
            <>
              <Typography variant="body1" sx={{ marginRight: 2 }}>
                Welcome, {user.displayName}
              </Typography>
              <Button color="inherit" onClick={handleSignOut}>
                Sign Out
              </Button>
            </>
          ) : (
            <Button color="inherit" onClick={handleSignIn}>
              Sign In with Google
            </Button>
          )}
        </Toolbar>
      </AppBar>
      <Box p={3} sx={{ backgroundColor: "#e3f2fd", minHeight: "100vh" }}>
        <Grid container justifyContent="center" spacing={3}>
          <Grid item xs={12} sm={10} md={8} lg={6}>
            <Card sx={{ borderRadius: 2, p: 3 }}>
              <Typography variant="h4" align="center" gutterBottom>
                Your Pantry, Your Way!
              </Typography>
              {user ? (
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6">{editingItemId ? "Edit Item" : "Add New Item"}</Typography>
                    <TextField
                      label="Name"
                      value={itemName}
                      onChange={(e) => setItemName(e.target.value)}
                      variant="outlined"
                      margin="normal"
                      fullWidth
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      label="Quantity"
                      type="number"
                      value={itemCount}
                      onChange={(e) => setItemCount(e.target.value)}
                      variant="outlined"
                      margin="normal"
                      fullWidth
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      label="Expiration Date"
                      type="date"
                      value={itemDate}
                      onChange={(e) => setItemDate(e.target.value)}
                      variant="outlined"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      sx={{ mb: 2 }}
                    />
                    {errorMessage && (
                      <Typography variant="body2" color="error" align="center" sx={{ mb: 2 }}>
                        {errorMessage}
                      </Typography>
                    )}
                    <Button
                      onClick={addItem}
                      variant="contained"
                      color="primary"
                      fullWidth
                      sx={{ mb: 2 }}
                    >
                      {editingItemId ? "Save Changes" : "Add Item"}
                    </Button>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6">Search & Manage Pantry Items</Typography>
                    <TextField
                      label="Search..."
                      variant="outlined"
                      margin="normal"
                      fullWidth
                      sx={{ mb: 2 }}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Button
                      onClick={searchItems}
                      variant="contained"
                      color="secondary"
                      fullWidth
                      sx={{ mb: 2 }}
                    >
                      Search
                    </Button>
                    <Button
                      onClick={generateRecipe}
                      variant="contained"
                      color="secondary"
                      fullWidth
                      sx={{ mb: 2 }}
                    >
                      Generate Recipe
                    </Button>
                  </Grid>
                  <Grid item xs={12}>
                    {inventory.map((item) => (
                      <Card
                        key={item.id}
                        sx={{
                          mb: 2,
                          boxShadow: hoveredItemId === item.id ? "0 0 20px rgba(0, 0, 0, 0.2)" : "",
                          transition: "box-shadow 0.3s ease",
                        }}
                        onMouseEnter={() => setHoveredItemId(item.id)}
                        onMouseLeave={() => setHoveredItemId(null)}
                      >
                        <CardContent>
                          <Grid container alignItems="center" justifyContent="space-between">
                            <Grid item>
                              <Typography variant="h6">{item.name}</Typography>
                              <Typography variant="body2">Quantity: {item.count}</Typography>
                              <Typography variant="body2">Expiration Date: {item.date}</Typography>
                            </Grid>
                            <Grid item>
                              <IconButton onClick={() => startEdit(item)}>
                                <EditIcon />
                              </IconButton>
                              <IconButton onClick={() => deleteItem(item.id)}>
                                <DeleteIcon />
                              </IconButton>
                            </Grid>
                          </Grid>
                        </CardContent>
                      </Card>
                    ))}
                  </Grid>
                </Grid>
              ) : (
                <Typography variant="body1" align="center">
                  Please sign in to manage your pantry items.
                </Typography>
              )}
            </Card>
          </Grid>
        </Grid>
        {recipe && (
          <Grid container justifyContent="center" sx={{ mt: 4 }}>
            <Grid item xs={12} sm={10} md={8} lg={6}>
              <Card sx={{ borderRadius: 2, p: 3 }}>
                <Typography variant="h5" gutterBottom>
                  Generated Recipe
                </Typography>
                <ReactMarkdown>{recipe}</ReactMarkdown>
              </Card>
            </Grid>
          </Grid>
        )}
      </Box>
    </ThemeProvider>
  );
}
