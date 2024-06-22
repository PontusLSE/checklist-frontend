import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const Checklist = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [checklist, setChecklist] = useState(null);
    const [projectInfo, setProjectInfo] = useState({
        kundens_namn: '',
        kundens_adress: '',
        kundens_referens: '',
        utfors_av: '',
        arbetsledare: '',
        projektets_nummer: '',
        projektets_namn: '',
        aktuellt_datum: ''
    });

    const fetchChecklist = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/checklists/${id}`);
            setChecklist(response.data);
            setProjectInfo(response.data.projektinformation);
        } catch (error) {
            console.error('Error fetching checklist:', error);
        }
    };

    useEffect(() => {
        fetchChecklist();
    }, [id]);

    const handleSave = async () => {
        try {
            await axios.put(`${process.env.REACT_APP_API_URL}/checklists/${id}`, {
                projektinformation: projectInfo,
                kontrollpunkter: checklist.kontrollpunkter
            });
            alert('Checklist saved successfully');
        } catch (error) {
            console.error('Error saving checklist:', error);
        }
    };

    const handleExportPDF = () => {
        const doc = new jsPDF();
        doc.text('Egenkontroll Solcellssystem', 10, 10);

        doc.text(`Kundens namn: ${projectInfo.kundens_namn}`, 10, 20);
        doc.text(`Kundens adress: ${projectInfo.kundens_adress}`, 10, 30);
        doc.text(`Kundens referens: ${projectInfo.kundens_referens}`, 10, 40);
        doc.text(`Utförs av: ${projectInfo.utfors_av}`, 10, 50);
        doc.text(`Arbetsledare: ${projectInfo.arbetsledare}`, 10, 60);
        doc.text(`Projektets nummer: ${projectInfo.projektets_nummer}`, 10, 70);
        doc.text(`Projektets namn: ${projectInfo.projektets_namn}`, 10, 80);
        doc.text(`Aktuellt datum: ${projectInfo.aktuellt_datum}`, 10, 90);

        checklist.kontrollpunkter.forEach((category, index) => {
            doc.text(category.kategori, 10, 100 + (index * 10));
            category.punkter.forEach((item, itemIndex) => {
                doc.text(`${item.kontrollpunkt}: ${item.utförd ? 'Ja' : 'Nej'}`, 10, 110 + (index * 10) + (itemIndex * 10));
            });
        });

        doc.save('checklist.pdf');
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProjectInfo(prevInfo => ({
            ...prevInfo,
            [name]: value
        }));
    };

    return (
        <div>
            {checklist ? (
                <div>
                    <h1>Egenkontroll Solcellssystem</h1>
                    <div>
                        <label>Kundens namn:</label>
                        <input type="text" name="kundens_namn" value={projectInfo.kundens_namn} onChange={handleInputChange} />
                        <label>Kundens adress:</label>
                        <input type="text" name="kundens_adress" value={projectInfo.kundens_adress} onChange={handleInputChange} />
                        <label>Kundens referens:</label>
                        <input type="text" name="kundens_referens" value={projectInfo.kundens_referens} onChange={handleInputChange} />
                        <label>Utförs av:</label>
                        <input type="text" name="utfors_av" value={projectInfo.utfors_av} onChange={handleInputChange} />
                        <label>Arbetsledare:</label>
                        <input type="text" name="arbetsledare" value={projectInfo.arbetsledare} onChange={handleInputChange} />
                        <label>Projektets nummer:</label>
                        <input type="text" name="projektets_nummer" value={projectInfo.projektets_nummer} onChange={handleInputChange} />
                        <label>Projektets namn:</label>
                        <input type="text" name="projektets_namn" value={projectInfo.projektets_namn} onChange={handleInputChange} />
                        <label>Aktuellt datum:</label>
                        <input type="text" name="aktuellt_datum" value={projectInfo.aktuellt_datum} onChange={handleInputChange} />
                    </div>
                    {checklist.kontrollpunkter.map((category, index) => (
                        <div key={index}>
                            <h2>{category.kategori}</h2>
                            {category.punkter.map((item, itemIndex) => (
                                <div key={itemIndex}>
                                    <label>
                                        <input
                                            type="checkbox"
                                            checked={item.utförd}
                                            onChange={(e) => {
                                                const updatedChecklist = { ...checklist };
                                                updatedChecklist.kontrollpunkter[index].punkter[itemIndex].utförd = e.target.checked;
                                                setChecklist(updatedChecklist);
                                            }}
                                        />
                                        {item.kontrollpunkt}
                                    </label>
                                    <textarea
                                        value={item.kommentarer}
                                        onChange={(e) => {
                                            const updatedChecklist = { ...checklist };
                                            updatedChecklist.kontrollpunkter[index].punkter[itemIndex].kommentarer = e.target.value;
                                            setChecklist(updatedChecklist);
                                        }}
                                    />
                                    {item.bilder && item.bilder.map((image, imgIndex) => (
                                        <div key={imgIndex}>
                                            <img src={image} alt={`Upload ${imgIndex}`} />
                                            <button onClick={() => {
                                                const updatedChecklist = { ...checklist };
                                                updatedChecklist.kontrollpunkter[index].punkter[itemIndex].bilder.splice(imgIndex, 1);
                                                setChecklist(updatedChecklist);
                                            }}>Remove Image</button>
                                        </div>
                                    ))}
                                    <input type="file" onChange={(e) => {
                                        const file = e.target.files[0];
                                        const reader = new FileReader();
                                        reader.onloadend = () => {
                                            const updatedChecklist = { ...checklist };
                                            updatedChecklist.kontrollpunkter[index].punkter[itemIndex].bilder.push(reader.result);
                                            setChecklist(updatedChecklist);
                                        };
                                        reader.readAsDataURL(file);
                                    }} />
                                </div>
                            ))}
                        </div>
                    ))}
                    <button onClick={handleSave}>Save</button>
                    <button onClick={handleExportPDF}>Export as PDF</button>
                    <button onClick={() => navigate('/')}>Back</button>
                </div>
            ) : (
                <p>Loading...</p>
            )}
        </div>
    );
};

export default Checklist;
