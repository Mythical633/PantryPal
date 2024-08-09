'use client';

import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { AppBar, Toolbar, Typography, Button, Box, Grid, Card, CardContent, TextField, IconButton } from '@mui/material';
import { auth, provider, signInWithPopup, signOut, firestore } from "../app/firebase"
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc, query, where } from "firebase/firestore";

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
      main: '#1976d2',
    },
    secondary: {
      main: '#2196f3',
    },
    background: {
      default: '#e3f2fd',
      paper: '#ffffff',
    },
    text: {
      primary: '#212121',
      secondary: '#757575',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
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

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const link = document.createElement('link');
      link.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
      return () => {
        document.head.removeChild(link);
      };
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
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
    }
  }, []);

  const handleSignIn = async () => {
    if (typeof window !== 'undefined') {
      try {
        await signInWithPopup(auth, provider);
      } catch (error) {
        console.error("Error signing in with Google: ", error);
      }
    }
  };

  const handleSignOut = async () => {
    if (typeof window !== 'undefined') {
      try {
        await signOut(auth);
      } catch (error) {
        console.error("Error signing out: ", error);
      }
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
    const response = await fetch("/api/generate-recipe", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        ingredients: itemNames
      })
    });

    const data = await response.json();
    setRecipe(data.recipe);
  };

  return (
    <ThemeProvider theme={theme}>
      <Head>
        <title>PantryGo </title>
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
                Your Pantry, Your Way
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
                    <Typography variant="h6">Search</Typography>
                    <TextField
                      label="Search Items"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      variant="outlined"
                      margin="normal"
                      fullWidth
                      sx={{ mb: 2 }}
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
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="h6">Pantry Items</Typography>
                    <Grid container spacing={2}>
                      {inventory.map(item => (
                        <Grid item xs={12} key={item.id}>
                          <Card
                            sx={{
                              borderRadius: 2,
                              backgroundColor: hoveredItemId === item.id ? "#e3f2fd" : "#ffffff",
                            }}
                            onMouseEnter={() => setHoveredItemId(item.id)}
                            onMouseLeave={() => setHoveredItemId(null)}
                          >
                            <CardContent>
                              <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                                {item.name} - {item.count}
                              </Typography>
                              <Typography variant="body2">
                                Expiration Date: {item.date}
                              </Typography>
                              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                                <IconButton onClick={() => startEdit(item)} color="primary">
                                  <EditIcon />
                                </IconButton>
                                <IconButton onClick={() => deleteItem(item.id)} color="secondary">
                                  <DeleteIcon />
                                </IconButton>
                              </Box>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      onClick={generateRecipe}
                      variant="contained"
                      color="secondary"
                      fullWidth
                    >
                      Generate Recipe
                    </Button>
                    {recipe && (
                      <Box mt={2}>
                        <Typography variant="h6">Recipe Suggestion:</Typography>
                        <Typography variant="body1">{recipe}</Typography>
                      </Box>
                    )}
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
      </Box>
    </ThemeProvider>
  );
}

export const dynamic = "force-dynamic";