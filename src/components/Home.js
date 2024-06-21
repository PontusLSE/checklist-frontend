import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Typography, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton } from '@mui/material';
import { Edit, FileCopy, Delete } from '@mui/icons-material';

function Home() {
  const [checklists, setChecklists] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get('/api/checklists').then(response => {
      setChecklists(response.data);
    }).catch(error => {
      console.error("There was an error fetching the checklists!", error);
      setError("There was an error fetching the checklists.");
    });
  }, []);

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <Typography variant="h4" gutterBottom>List of checklists:</Typography>
      <List>
        {checklists.map((checklist, index) => (
          <ListItem key={checklist._id}>
            <ListItemText
              primary={`${index + 1}. ${checklist.title}`}
            />
            <ListItemSecondaryAction>
              <IconButton edge="end" component={Link} to={`/checklist/${checklist._id}`}>
                <Edit />
              </IconButton>
              <IconButton edge="end" onClick={() => duplicateChecklist(checklist._id)}>
                <FileCopy />
              </IconButton>
              <IconButton edge="end" onClick={() => deleteChecklist(checklist._id)}>
                <Delete />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
    </div>
  );
}

const duplicateChecklist = async (id) => {
  await axios.post(`/api/checklists/duplicate/${id}`);
  window.location.reload();
};

const deleteChecklist = async (id) => {
  await axios.delete(`/api/checklists/${id}`);
  window.location.reload();
};

export default Home;
