import React, { useState, useEffect } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const Checklist = ({ match }) => {
  const [checklist, setChecklist] = useState({
    projektinformation: {
      kundens_namn: '',
      kundens_adress: '',
      kundens_referens: '',
      utfors_av: '',
      arbetsledare: '',
      projektets_nummer: '',
      projektets_namn: '',
      aktuellt_datum: ''
    },
    kontrollpunkter: [],
    images: []
  });

  useEffect(() => {
    const fetchChecklist = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/checklists/${match.params.id}`);
        setChecklist(response.data);
      } catch (error) {
        console.error('Error fetching checklist:', error);
      }
    };
    fetchChecklist();
  }, [match.params.id]);

  const handleInputChange = (e, index) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith('projektinformation')) {
      const key = name.split('.')[1];
      setChecklist(prevState => ({
        ...prevState,
        projektinformation: {
          ...prevState.projektinformation,
          [key]: value
        }
      }));
    } else {
      const newKontrollpunkter = [...checklist.kontrollpunkter];
      if (type === 'checkbox') {
        newKontrollpunkter[index][name] = checked;
      } else {
        newKontrollpunkter[index][name] = value;
      }
      setChecklist(prevState => ({
        ...prevState,
        kontrollpunkter: newKontrollpunkter
      }));
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/checklists/upload`, formData);
      setChecklist(prevState => ({
        ...prevState,
        images: [...prevState.images, response.data.url]
      }));
    } catch (error) {
      console.error('Error uploading files:', error);
    }
  };

  const handleFileDelete = async (url) => {
    if (!window.confirm('Are you sure you want to delete this image?')) return;
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/checklists/upload`, { data: { url } });
      setChecklist(prevState => ({
        ...prevState,
        images: prevState.images.filter(image => image !== url)
      }));
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  };

  const handleSave = async () => {
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/checklists/${match.params.id}`, checklist);
      alert('Checklist saved successfully');
    } catch (error) {
      console.error('Error saving checklist:', error);
    }
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text('Egenkontroll solcellsmontage', 10, 10);
    doc.autoTable({ html: '#checklist-table' });
    doc.save('checklist.pdf');
  };

  return (
    <div>
      <h2>Checklist</h2>
      <div>
        <label>Kundens namn: </label>
        <input type="text" name="projektinformation.kundens_namn" value={checklist.projektinformation.kundens_namn} onChange={handleInputChange} />
      </div>
      <div>
        <label>Kundens adress: </label>
        <input type="text" name="projektinformation.kundens_adress" value={checklist.projektinformation.kundens_adress} onChange={handleInputChange} />
      </div>
      <div>
        <label>Kundens referens: </label>
        <input type="text" name="projektinformation.kundens_referens" value={checklist.projektinformation.kundens_referens} onChange={handleInputChange} />
      </div>
      <div>
        <label>Utförs av: </label>
        <input type="text" name="projektinformation.utfors_av" value={checklist.projektinformation.utfors_av} onChange={handleInputChange} />
      </div>
      <div>
        <label>Arbetsledare: </label>
        <input type="text" name="projektinformation.arbetsledare" value={checklist.projektinformation.arbetsledare} onChange={handleInputChange} />
      </div>
      <div>
        <label>Projektets nummer: </label>
        <input type="text" name="projektinformation.projektets_nummer" value={checklist.projektinformation.projektets_nummer} onChange={handleInputChange} />
      </div>
      <div>
        <label>Projektets namn: </label>
        <input type="text" name="projektinformation.projektets_namn" value={checklist.projektinformation.projektets_namn} onChange={handleInputChange} />
      </div>
      <div>
        <label>Aktuellt datum: </label>
        <input type="text" name="projektinformation.aktuellt_datum" value={checklist.projektinformation.aktuellt_datum} onChange={handleInputChange} />
      </div>
      <ul>
        {checklist.kontrollpunkter.map((punkt, index) => (
          <li key={index}>
            <label>{punkt.kontrollpunkt}</label>
            <input type="checkbox" name="ja" checked={punkt.ja} onChange={e => handleInputChange(e, index)} /> Ja
            <input type="checkbox" name="nej" checked={punkt.nej} onChange={e => handleInputChange(e, index)} /> Nej
            <input type="text" name="kommentar" value={punkt.kommentar} onChange={e => handleInputChange(e, index)} placeholder="Kommentar" />
          </li>
        ))}
      </ul>
      <div>
        <input type="file" onChange={handleFileUpload} />
        {checklist.images && checklist.images.map((url, index) => (
          <div key={index}>
            <img src={url} alt={`Upload ${index}`} width="100" />
            <button onClick={() => handleFileDelete(url)}>Delete</button>
          </div>
        ))}
      </div>
      <button onClick={handleSave}>Spara</button>
      <button onClick={handleExportPDF}>Export as PDF</button>
    </div>
  );
};

export default Checklist;
