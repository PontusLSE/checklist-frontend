import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Button, TextField, Typography, Grid } from '@mui/material';

function Checklist() {
  const { id } = useParams();
  const [checklist, setChecklist] = useState(null);

  useEffect(() => {
    axios.get(`/api/checklists/${id}`).then(response => {
      setChecklist(response.data);
    });
  }, [id]);

  if (!checklist) return <div>Loading...</div>;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setChecklist(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    await axios.put(`/api/checklists/${id}`, checklist);
  };

  const handleExportPDF = async () => {
    const response = await axios.get(`/api/checklists/${id}/pdf`, { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'checklist.pdf');
    document.body.appendChild(link);
    link.click();
  };

  return (
    <div>
      <Typography variant="h4" gutterBottom>{checklist.title}</Typography>
      <Grid container spacing={3}>
        {checklist.items.map((item, index) => (
          <Grid item xs={12} key={index}>
            <TextField
              fullWidth
              label={`Item ${index + 1}`}
              name={`item-${index}`}
              value={item.text}
              onChange={(e) => handleChange(e, index)}
            />
          </Grid>
        ))}
      </Grid>
      <Button variant="contained" color="primary" onClick={handleSave}>Save</Button>
      <Button variant="contained" color="secondary" onClick={handleExportPDF}>Export as PDF</Button>
    </div>
  );
}

export default Checklist;