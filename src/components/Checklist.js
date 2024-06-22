import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const Checklist = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [checklist, setChecklist] = useState(null);

  useEffect(() => {
    fetchChecklist();
  }, []);

  const fetchChecklist = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/checklists/${id}`);
      setChecklist(response.data);
    } catch (error) {
      console.error('Error fetching checklist:', error);
    }
  };

  const handleSave = async () => {
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/checklists/${id}`, checklist);
      alert('Checklist saved successfully');
    } catch (error) {
      console.error('Error saving checklist:', error);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/checklists/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setChecklist({
        ...checklist,
        images: [...(checklist.images || []), response.data.url]
      });
    } catch (error) {
      console.error('Error uploading files:', error);
    }
  };

  const handleFileDelete = async (url) => {
    if (!window.confirm('Are you sure you want to delete this image?')) return;

    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/checklists/upload`, { data: { url } });
      setChecklist({
        ...checklist,
        images: checklist.images.filter(image => image !== url)
      });
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.addImage('/logga.png', 'PNG', 10, 10, 50, 20);
    doc.setFontSize(18);
    doc.text('Egenkontroll Solcellssystem', 70, 20);
    doc.setFontSize(12);
    doc.text(`Kundens namn: ${checklist.projektinformation.kundens_namn}`, 10, 40);
    doc.text(`Kundens adress: ${checklist.projektinformation.kundens_adress}`, 10, 50);
    doc.text(`Kundens referens: ${checklist.projektinformation.kundens_referens}`, 10, 60);
    doc.text(`Utförs av: ${checklist.projektinformation.utfors_av}`, 10, 70);
    doc.text(`Arbetsledare: ${checklist.projektinformation.arbetsledare}`, 10, 80);
    doc.text(`Projektets nummer: ${checklist.projektinformation.projektets_nummer}`, 10, 90);
    doc.text(`Projektets namn: ${checklist.projektinformation.projektets_namn}`, 10, 100);
    doc.text(`Aktuellt datum: ${checklist.projektinformation.aktuellt_datum}`, 10, 110);

    const tableColumn = ["Kontrollpunkt", "Utförd", "Kommentar"];
    const tableRows = [];

    checklist.kontrollpunkter.forEach(kontrollpunkt => {
      const kontrolldata = [
        kontrollpunkt.punkt,
        kontrollpunkt.utförd ? "Ja" : "Nej",
        kontrollpunkt.kommentar || ""
      ];
      tableRows.push(kontrolldata);
    });

    doc.autoTable(tableColumn, tableRows, { startY: 120 });
    doc.save('egenkontroll.pdf');
  };

  const handleInputChange = (event, index) => {
    const { name, value, type, checked } = event.target;
    const updatedKontrollpunkter = [...checklist.kontrollpunkter];

    if (type === 'checkbox') {
      updatedKontrollpunkter[index][name] = checked;
    } else {
      updatedKontrollpunkter[index][name] = value;
    }

    setChecklist({ ...checklist, kontrollpunkter: updatedKontrollpunkter });
  };

  const handleBack = () => {
    navigate('/');
  };

  if (!checklist) return <div>Loading...</div>;

  return (
    <div>
      <h1>Egenkontroll Solcellssystem</h1>
      <button onClick={handleBack}>Tillbaka</button>
      <div>
        <label>
          Kundens namn:
          <input
            type="text"
            value={checklist.projektinformation.kundens_namn}
            onChange={e => setChecklist({ ...checklist, projektinformation: { ...checklist.projektinformation, kundens_namn: e.target.value } })}
          />
        </label>
        <label>
          Kundens adress:
          <input
            type="text"
            value={checklist.projektinformation.kundens_adress}
            onChange={e => setChecklist({ ...checklist, projektinformation: { ...checklist.projektinformation, kundens_adress: e.target.value } })}
          />
        </label>
        <label>
          Kundens referens:
          <input
            type="text"
            value={checklist.projektinformation.kundens_referens}
            onChange={e => setChecklist({ ...checklist, projektinformation: { ...checklist.projektinformation, kundens_referens: e.target.value } })}
          />
        </label>
        <label>
          Utförs av:
          <input
            type="text"
            value={checklist.projektinformation.utfors_av}
            onChange={e => setChecklist({ ...checklist, projektinformation: { ...checklist.projektinformation, utfors_av: e.target.value } })}
          />
        </label>
        <label>
          Arbetsledare:
          <input
            type="text"
            value={checklist.projektinformation.arbetsledare}
            onChange={e => setChecklist({ ...checklist, projektinformation: { ...checklist.projektinformation, arbetsledare: e.target.value } })}
          />
        </label>
        <label>
          Projektets nummer:
          <input
            type="text"
            value={checklist.projektinformation.projektets_nummer}
            onChange={e => setChecklist({ ...checklist, projektinformation: { ...checklist.projektinformation, projektets_nummer: e.target.value } })}
          />
        </label>
        <label>
          Projektets namn:
          <input
            type="text"
            value={checklist.projektinformation.projektets_namn}
            onChange={e => setChecklist({ ...checklist, projektinformation: { ...checklist.projektinformation, projektets_namn: e.target.value } })}
          />
        </label>
        <label>
          Aktuellt datum:
          <input
            type="text"
            value={checklist.projektinformation.aktuellt_datum}
            onChange={e => setChecklist({ ...checklist, projektinformation: { ...checklist.projektinformation, aktuellt_datum: e.target.value } })}
          />
        </label>
      </div>
      <ul>
        {checklist.kontrollpunkter.map((punkt, index) => (
          <li key={index}>
            <label>
              <input
                type="checkbox"
                name="utförd"
                checked={punkt.utförd}
                onChange={e => handleInputChange(e, index)}
              />
              {punkt.punkt}
            </label>
            <textarea
              name="kommentar"
              value={punkt.kommentar}
              onChange={e => handleInputChange(e, index)}
            />
          </li>
        ))}
      </ul>
      <div>
        <input type="file" onChange={handleFileUpload} />
        <ul>
          {checklist.images && checklist.images.map((url, index) => (
            <li key={index}>
              <img src={url} alt={`uploaded-${index}`} style={{ width: '100px' }} />
              <button onClick={() => handleFileDelete(url)}>Delete</button>
            </li>
          ))}
        </ul>
      </div>
      <button onClick={handleSave}>Save Checklist</button>
      <button onClick={handleExportPDF}>Export as PDF</button>
    </div>
  );
};

export default Checklist;
