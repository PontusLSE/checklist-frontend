import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, TextField, Typography, Grid, Checkbox, FormControlLabel, IconButton } from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';
import jsPDF from 'jspdf';

function Checklist() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [checklist, setChecklist] = useState(null);

  useEffect(() => {
    const fetchChecklist = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/checklists`);
        const foundChecklist = response.data.find(cl => cl.id === id);
        setChecklist(foundChecklist);
      } catch (error) {
        console.error('Error fetching checklist:', error);
      }
    };

    fetchChecklist();
  }, [id]);

  if (!checklist) return <div>Loading...</div>;

  const handleCheckboxChange = (e, katIndex, punktIndex) => {
    const { checked } = e.target;
    setChecklist(prev => {
      const updatedChecklist = { ...prev };
      updatedChecklist.kontrollpunkter[katIndex].punkter[punktIndex].utförd = checked;
      return updatedChecklist;
    });
  };

  const handleCommentChange = (e, katIndex, punktIndex) => {
    const { value } = e.target;
    setChecklist(prev => {
      const updatedChecklist = { ...prev };
      updatedChecklist.kontrollpunkter[katIndex].punkter[punktIndex].kommentarer = value;
      return updatedChecklist;
    });
  };

  const handleFileUpload = async (e, katIndex, punktIndex) => {
    const formData = new FormData();
    for (let i = 0; i < e.target.files.length; i++) {
      formData.append('files', e.target.files[i]);
    }

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/checklists/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      const fileUrls = response.data;

      setChecklist(prev => {
        const updatedChecklist = { ...prev };
        updatedChecklist.kontrollpunkter[katIndex].punkter[punktIndex].bilder.push(...fileUrls);
        return updatedChecklist;
      });
    } catch (error) {
      console.error('Error uploading files:', error);
    }
  };

  const handleFileDelete = async (katIndex, punktIndex, bildIndex) => {
    if (window.confirm('Are you sure you want to delete this image?')) {
      try {
        const imagePath = checklist.kontrollpunkter[katIndex].punkter[punktIndex].bilder[bildIndex];
        await axios.delete(`${process.env.REACT_APP_API_URL}/checklists/upload`, { data: { imagePath } });

        setChecklist(prev => {
          const updatedChecklist = { ...prev };
          updatedChecklist.kontrollpunkter[katIndex].punkter[punktIndex].bilder.splice(bildIndex, 1);
          return updatedChecklist;
        });
      } catch (error) {
        console.error('Error deleting image:', error);
      }
    }
  };

  const handleSave = async () => {
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/checklists/${id}`, checklist);
      alert('Checklist saved!');
    } catch (error) {
      console.error('Error saving checklist:', error);
    }
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text(checklist.projektinformation.projektets_namn, 10, 10);
    let y = 20;
    checklist.kontrollpunkter.forEach((kategori) => {
      doc.text(kategori.kategori, 10, y);
      y += 10;
      kategori.punkter.forEach((punkt) => {
        doc.text(`${punkt.kontrollpunkt} - ${punkt.utförd ? 'Done' : 'Not Done'}`, 10, y);
        y += 10;
        if (punkt.kommentarer) {
          doc.text(`Comments: ${punkt.kommentarer}`, 10, y);
          y += 10;
        }
        punkt.bilder.forEach((bild) => {
          doc.text(`Image: ${bild}`, 10, y);
          y += 10;
        });
        y += 10;
      });
      y += 10;
    });
    doc.save(`${checklist.projektinformation.projektets_namn}.pdf`);
  };

  const handleBack = () => {
    navigate('/');
  };

  return (
    <div>
      <Typography variant="h4" gutterBottom>{checklist.projektinformation.projektets_namn}</Typography>
      {checklist.kontrollpunkter.map((kategori, katIndex) => (
        <div key={katIndex}>
          <Typography variant="h6">{kategori.kategori}</Typography>
          {kategori.punkter.map((punkt, punktIndex) => (
            <Grid container spacing={2} alignItems="center" key={punktIndex}>
              <Grid item xs={6}>
                <FormControlLabel
                  control={<Checkbox checked={punkt.utförd} onChange={(e) => handleCheckboxChange(e, katIndex, punktIndex)} />}
                  label={punkt.kontrollpunkt}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Kommentarer"
                  fullWidth
                  multiline
                  value={punkt.kommentarer}
                  onChange={(e) => handleCommentChange(e, katIndex, punktIndex)}
                />
              </Grid>
              <Grid item xs={12}>
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id={`file-upload-${katIndex}-${punktIndex}`}
                  multiple
                  type="file"
                  onChange={(e) => handleFileUpload(e, katIndex, punktIndex)}
                />
                <label htmlFor={`file-upload-${katIndex}-${punktIndex}`}>
                  <Button variant="contained" color="primary" component="span" startIcon={<PhotoCamera />}>
                    Upload
                  </Button>
                </label>
              </Grid>
              <Grid item xs={12}>
                {punkt.bilder.map((bild, bildIndex) => (
                  <div key={bildIndex}>
                    <img src={bild} alt={`Bild ${bildIndex}`} style={{ maxWidth: '100%' }} />
                    <IconButton color="secondary" onClick={() => handleFileDelete(katIndex, punktIndex, bildIndex)}>
                      <DeleteIcon />
                    </IconButton>
                  </div>
                ))}
              </Grid>
            </Grid>
          ))}
        </div>
      ))}
      <Button variant="contained" color="primary" onClick={handleSave}>Save</Button>
      <Button variant="contained" onClick={handleExportPDF}>Export as PDF</Button>
      <Button variant="contained" onClick={handleBack}>Back</Button>
    </div>
  );
}

export default Checklist;
