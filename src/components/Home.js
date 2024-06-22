import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Typography, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, TextField, Button } from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import axios from 'axios';

function Home() {
  const [checklists, setChecklists] = useState([]);
  const [newChecklistName, setNewChecklistName] = useState('');

  useEffect(() => {
    const fetchChecklists = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/checklists`);
        if (Array.isArray(response.data)) {
          setChecklists(response.data);
        } else {
          console.error('Expected an array but got:', response.data);
        }
      } catch (error) {
        console.error('Error fetching checklists:', error);
      }
    };

    fetchChecklists();
  }, []);

  const handleCreateChecklist = async () => {
    try {
      const templateResponse = await axios.get(`${process.env.REACT_APP_API_URL}/checklists/template`);
      const newChecklist = { ...templateResponse.data, id: String(Date.now()), projektinformation: { ...templateResponse.data.projektinformation, projektets_namn: newChecklistName } };

      const response = await axios.post(`${process.env.REACT_APP_API_URL}/checklists`, newChecklist);
      setChecklists([...checklists, response.data]);
      setNewChecklistName('');
    } catch (error) {
      console.error('Error creating checklist:', error);
    }
  };

  const deleteChecklist = async (id) => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/checklists/${id}`);
      setChecklists(checklists.filter(checklist => checklist.id !== id));
    } catch (error) {
      console.error('Error deleting checklist:', error);
    }
  };

  return (
    <div>
      <Typography variant="h4" gutterBottom>Egenkontroller</Typography>
      <List>
        {checklists.map((checklist) => (
          <ListItem key={checklist.id}>
            <ListItemText primary={checklist.projektinformation ? checklist.projektinformation.projektets_namn : "Unnamed Project"} />
            <ListItemSecondaryAction>
              <IconButton edge="end" component={Link} to={`/checklist/${checklist.id}`}>
                <Edit />
              </IconButton>
              <IconButton edge="end" onClick={() => deleteChecklist(checklist.id)}>
                <Delete />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
      <div>
        <TextField
          label="New Checklist Name"
          value={newChecklistName}
          onChange={(e) => setNewChecklistName(e.target.value)}
        />
        <Button variant="contained" color="primary" onClick={handleCreateChecklist}>
          Create Checklist
        </Button>
      </div>
    </div>
  );
}

export default Home;
