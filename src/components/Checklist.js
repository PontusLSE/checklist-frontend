import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Typography, Grid, FormControlLabel, Checkbox, TextField, Button, IconButton, Container } from '@mui/material';
import { PhotoCamera, Delete as DeleteIcon } from '@mui/icons-material';
import axios from 'axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

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

  const handleProjectInfoChange = (event) => {
    const { name, value } = event.target;
    setChecklist((prevChecklist) => ({
      ...prevChecklist,
      projektinformation: {
        ...prevChecklist.projektinformation,
        [name]: value,
      },
    }));
  };

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
    doc.addImage('/logga.png', 'PNG', 10, 10, 50, 50);
    doc.text('Egenkontroll solcellsmontage', 10, 70);

    const projektinfo = checklist.projektinformation;
    doc.text(`Kundens namn: ${projektinfo.kundens_namn}`, 10, 80);
    doc.text(`Kundens adress: ${projektinfo.kundens_adress}`, 10, 90);
    doc.text(`Kundens referens: ${projektinfo.kundens_referens}`, 10, 100);
    doc.text(`Utförs av: ${projektinfo.utfors_av}`, 10, 110);
    doc.text(`Arbetsledare: ${projektinfo.arbetsledare}`, 10, 120);
    doc.text(`Projektets nummer: ${projektinfo.projektets_nummer}`, 10, 130);
    doc.text(`Projektets namn: ${projektinfo.projektets_namn}`, 10, 140);
    doc.text(`Aktuellt datum: ${projektinfo.aktuellt_datum}`, 10, 150);

    checklist.kontrollpunkter.forEach((kategori, katIndex) => {
      doc.addPage();
      doc.text(kategori.kategori, 10, 20);
      kategori.punkter.forEach((punkt, punktIndex) => {
        doc.text(`${punkt.kontrollpunkt}: ${punkt.utförd ? 'Ja' : 'Nej'} - ${punkt.kommentarer}`, 10, 30 + punktIndex * 10);
      });
    });

    doc.save('checklist.pdf');
  };

  if (!checklist) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Container>
      <Typography variant="h4" gutterBottom>Egenkontroll</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            label="Kundens namn"
            name="kundens_namn"
            value={checklist.projektinformation.kundens_namn}
            onChange={handleProjectInfoChange}
            fullWidth
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Kundens adress"
            name="kundens_adress"
            value={checklist.projektinformation.kundens_adress}
            onChange={handleProjectInfoChange}
            fullWidth
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Kundens referens"
            name="kundens_referens"
            value={checklist.projektinformation.kundens_referens}
            onChange={handleProjectInfoChange}
            fullWidth
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Utförs av"
            name="utfors_av"
            value={checklist.projektinformation.utfors_av}
            onChange={handleProjectInfoChange}
            fullWidth
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Arbetsledare"
            name="arbetsledare"
            value={checklist.projektinformation.arbetsledare}
            onChange={handleProjectInfoChange}
            fullWidth
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Projektets nummer"
            name="projektets_nummer"
            value={checklist.projektinformation.projektets_nummer}
            onChange={handleProjectInfoChange}
            fullWidth
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Projektets namn"
            name="projektets_namn"
            value={checklist.projektinformation.projektets_namn}
            onChange={handleProjectInfoChange}
            fullWidth
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Aktuellt datum"
            name="aktuellt_datum"
            value={checklist.projektinformation.aktuellt_datum}
            onChange={handleProjectInfoChange}
            fullWidth
          />
        </Grid>
      </Grid>
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
        Spara
      </Button>
      <Button variant="contained" color="secondary" onClick={handleExportPDF}>
        Exportera som PDF
      </Button>
      <Button variant="contained" onClick={() => navigate('/')}>
        Tillbaka
      </Button>
    </Container>
  );
}

export default Checklist;
