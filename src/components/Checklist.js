import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Typography, Grid, FormControlLabel, Checkbox, TextField, Button, IconButton, Container } from '@mui/material';
import { PhotoCamera, Delete as DeleteIcon } from '@mui/icons-material';
import axios from 'axios';
import jsPDF from 'jspdf';

function Checklist() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [checklist, setChecklist] = useState(null);

  useEffect(() => {
    const fetchChecklist = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/checklists/${id}`);
        setChecklist(response.data);
      } catch (error) {
        console.error('Error fetching checklist:', error);
      }
    };

    fetchChecklist();
  }, [id]);

  const handleCheckboxChange = (event, katIndex, punktIndex) => {
    const updatedChecklist = { ...checklist };
    updatedChecklist.kontrollpunkter[katIndex].punkter[punktIndex].utförd = event.target.checked;
    setChecklist(updatedChecklist);
  };

  const handleCommentChange = (event, katIndex, punktIndex) => {
    const updatedChecklist = { ...checklist };
    updatedChecklist.kontrollpunkter[katIndex].punkter[punktIndex].kommentarer = event.target.value;
    setChecklist(updatedChecklist);
  };

  const handleFileUpload = async (event, katIndex, punktIndex) => {
    const files = event.target.files;
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/checklists/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      const updatedChecklist = { ...checklist };
      updatedChecklist.kontrollpunkter[katIndex].punkter[punktIndex].bilder.push(...response.data);
      setChecklist(updatedChecklist);
    } catch (error) {
      console.error('Error uploading files:', error);
    }
  };

  const handleFileDelete = async (katIndex, punktIndex, bildIndex) => {
    try {
      const updatedChecklist = { ...checklist };
      const deletedImage = updatedChecklist.kontrollpunkter[katIndex].punkter[punktIndex].bilder[bildIndex];
      await axios.delete(`${process.env.REACT_APP_API_URL}/checklists/upload`, { data: { url: deletedImage } });
      updatedChecklist.kontrollpunkter[katIndex].punkter[punktIndex].bilder.splice(bildIndex, 1);
      setChecklist(updatedChecklist);
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  };

  const handleSave = async () => {
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/checklists/${id}`, checklist);
      alert('Checklist saved successfully!');
    } catch (error) {
      console.error('Error saving checklist:', error);
    }
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text(`Projekt: ${checklist.projektinformation.projektets_namn}`, 10, 10);
    checklist.kontrollpunkter.forEach((kategori, katIndex) => {
      doc.text(kategori.kategori, 10, 20 + katIndex * 10);
      kategori.punkter.forEach((punkt, punktIndex) => {
        doc.text(`${punkt.kontrollpunkt}: ${punkt.utförd ? 'Ja' : 'Nej'} - ${punkt.kommentarer}`, 10, 30 + punktIndex * 10 + katIndex * 10);
      });
    });
    doc.save('checklist.pdf');
  };

  if (!checklist) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Container>
      <Typography variant="h4" gutterBottom>Checklist</Typography>
      {checklist.kontrollpunkter.map((kategori, katIndex) => (
        <div key={katIndex}>
          <Typography variant="h6">{kategori.kategori}</Typography>
          {kategori.punkter.map((punkt, punktIndex) => (
            <Grid container spacing={2} key={punktIndex} alignItems="center">
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={punkt.utförd}
                      onChange={(event) => handleCheckboxChange(event, katIndex, punktIndex)}
                    />
                  }
                  label={punkt.kontrollpunkt}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Kommentarer"
                  value={punkt.kommentarer}
                  onChange={(event) => handleCommentChange(event, katIndex, punktIndex)}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12}>
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id={`icon-button-file-${katIndex}-${punktIndex}`}
                  type="file"
                  multiple
                  onChange={(event) => handleFileUpload(event, katIndex, punktIndex)}
                />
                <label htmlFor={`icon-button-file-${katIndex}-${punktIndex}`}>
                  <IconButton color="primary" component="span">
                    <PhotoCamera />
                  </IconButton>
                </label>
              </Grid>
              {punkt.bilder.map((bild, bildIndex) => (
                <Grid item xs={12} sm={6} key={bildIndex}>
                  <img src={bild} alt={`uploaded ${bildIndex}`} style={{ maxWidth: '100%' }} />
                  <IconButton onClick={() => handleFileDelete(katIndex, punktIndex, bildIndex)}>
                    <DeleteIcon />
                  </IconButton>
                </Grid>
              ))}
            </Grid>
          ))}
        </div>
      ))}
      <Button variant="contained" color="primary" onClick={handleSave}>
        Save
      </Button>
      <Button variant="contained" color="secondary" onClick={handleExportPDF}>
        Export as PDF
      </Button>
      <Button variant="contained" onClick={() => navigate('/')}>
        Back
      </Button>
    </Container>
  );
}

export default Checklist;
