// Storage using PHP and JSON file
const API_SAVE = 'save-survey.php';
const API_GET = 'get-results.php';

// Initialize results structure
let surveyResults = { totalResponses: 0, tallied: {} };

// Load results on page load
loadResults();

// Question definitions
const questions = {
    q1: {
        text: "1. How well do you know about disasters?",
        type: "radio",
        options: ["I know a lot", "I know a little", "I don't know much"]
    },
    q2: {
        text: "2. Have you ever joined school or community activities about disaster safety?",
        type: "radio",
        options: ["Yes, many times", "Only once", "No, never"]
    },
    q3: {
        text: "3. Where do you usually hear news or warnings about typhoons, earthquakes, or other disasters?",
        type: "checkbox",
        options: ["Barangay or LGU announcements", "Social media/online news", "TV or radio", "Family or friends"]
    },
    q4: {
        text: "4. Does your family have a 'Go Bag' or emergency kit at home?",
        type: "radio",
        options: ["Yes, it is complete", "We have some items", "We don't have one"]
    },
    q5: {
        text: "5. How often does your family check or change emergency supplies?",
        type: "radio",
        options: ["Regularly (every 3–6 months)", "Sometimes (every 6–12 months)", "Rarely", "Never"]
    },
    q6: {
        text: "6. Does your house have things that help protect it from strong winds or floods?",
        type: "radio",
        options: ["Yes, many", "Yes, a few", "None"]
    },
    q7: {
        text: "7. Have you or your family ever had your house damaged by a typhoon, earthquake, or other disasters?",
        type: "radio",
        options: ["Yes, big damage", "Yes, small damage", "No damage"]
    },
    q8: {
        text: "8. How sure are you that you know what to do during a typhoon, earthquake, or other disasters?",
        type: "radio",
        options: ["Very sure", "A little sure", "Not sure"]
    },
    q9: {
        text: "9. Do you know where the evacuation center in your area is?",
        type: "radio",
        options: ["Yes, I know exactly where", "I think I know", "No, I don't know"]
    },
    q10: {
        text: "10. Are you aware of any nearby safe places or higher ground you can go to during a disaster?",
        type: "radio",
        options: ["Yes, I know a place", "I think I know one", "No, I don't know"]
    },
    q11: {
        text: "11. Have you and your family talked about where to meet or how to contact each other during a disaster?",
        type: "radio",
        options: ["Yes, we have a clear plan", "We talked about it, but we're not sure", "No, we haven't talked about it"]
    },
    q12: {
        text: "12. Are you prepared to give basic first aid after a disaster?",
        type: "radio",
        options: ["Yes, I have training and supplies", "I have a first aid kit but no training", "I am not prepared"]
    },
    q13: {
        text: "13. Which dangers worry you the most?",
        type: "checkbox",
        options: ["Strong Winds (Typhoon)", "Heavy Rain/Floods", "Storm Surge", "Landslides", "Earthquake", "Tsunami", "Fire after disaster"]
    },
    q14: {
        text: "14. What do you think is the hardest part about preparing for disasters?",
        type: "radio",
        options: ["Not enough information", "Not enough supplies or money", "No clear plan", "Other"]
    },
    q15: {
        text: "15. Who do you think should teach and help the community prepare for disasters?",
        type: "checkbox",
        options: ["Local government", "National government", "Schools", "Community groups", "Others"]
    },
    q16: {
        text: "16. How important is it for neighbors to help each other during disasters?",
        type: "radio",
        options: ["Very important", "Important", "A little important", "Not important"]
    },
    q17: {
        text: "17. How good are the warning systems in your community?",
        type: "radio",
        options: ["Very good", "A little good", "Not very good", "Not good at all"]
    },
    q18: {
        text: "18. Have you ever checked the Facebook page or website of your town's DRRMC for announcements?",
        type: "radio",
        options: ["Yes, many times", "Sometimes", "Never"]
    },
    q19: {
        text: "19. If a big disaster happened today, how long do you think your family can manage without outside help?",
        type: "radio",
        options: ["Less than 1 day", "1–3 days", "3–7 days", "More than 7 days"]
    },
    q20: {
        text: "20. Would you like to join disaster safety activities or training in the future?",
        type: "radio",
        options: ["Yes, very interested", "A little interested", "Not very interested", "Not interested at all"]
    }
};

// Load results from server
async function loadResults() {
    try {
        const response = await fetch(API_GET);
        const data = await response.json();
        console.log('Loaded results:', data);
        surveyResults = data;
        updateResultsDisplay();
    } catch (error) {
        console.error('Error loading results:', error);
    }
}

// Save results to server
async function saveResults(answers) {
    try {
        console.log('Saving answers:', answers);
        const response = await fetch(API_SAVE, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ answers: answers })
        });
        
        const result = await response.json();
        console.log('Save result:', result);
        
        if (result.success) {
            // Reload results to update display
            await loadResults();
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error saving results:', error);
        return false;
    }
}

// Handle form submission
document.getElementById('surveyForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    console.log('Form submitted!');
    const formData = new FormData(this);
    const answers = {};
    
    // Process radio buttons
    for (let q in questions) {
        if (questions[q].type === 'radio') {
            const value = formData.get(q);
            if (value) {
                answers[q] = value;
            }
        }
    }
    
    // Process checkboxes (multiple answers)
    const checkboxQuestions = ['q3', 'q13', 'q15'];
    checkboxQuestions.forEach(q => {
        const values = formData.getAll(q);
        if (values.length > 0) {
            answers[q] = values;
        }
    });
    
    // Handle "Other" text inputs
    const q14Other = document.getElementById('q14_other_text').value;
    if (formData.get('q14_other') && q14Other) {
        answers.q14 = `Other: ${q14Other}`;
    }
    
    const q15Other = document.getElementById('q15_other_text').value;
    if (formData.get('q15_other') && q15Other) {
        if (!answers.q15) answers.q15 = [];
        if (Array.isArray(answers.q15)) {
            answers.q15.push(`Others: ${q15Other}`);
        } else {
            answers.q15 = [answers.q15, `Others: ${q15Other}`];
        }
    }
    
    console.log('Collected answers:', answers);
    
    // Save to server
    const saved = await saveResults(answers);
    
    if (saved) {
        // Show success message
        showSuccessMessage();
        
        // Reset form
        this.reset();
    } else {
        alert('Error saving response. Please try again.');
    }
});

// Reset form
function resetForm() {
    document.getElementById('surveyForm').reset();
}

// Update results display
function updateResultsDisplay() {
    document.getElementById('totalResponses').textContent = surveyResults.totalResponses;
    
    const container = document.getElementById('resultsContainer');
    container.innerHTML = '';
    
    const tallied = surveyResults.tallied || {};
    
    for (let q in questions) {
        const resultItem = document.createElement('div');
        resultItem.className = 'result-item';
        
        const title = document.createElement('h3');
        title.textContent = questions[q].text;
        resultItem.appendChild(title);
        
        const answers = tallied[q] || {};
        const hasData = Object.keys(answers).length > 0;
        
        if (hasData) {
            for (let answer in answers) {
                const count = answers[answer];
                
                const answerLine = document.createElement('div');
                answerLine.className = 'answer-line';
                
                const answerText = document.createElement('span');
                answerText.className = 'answer-text';
                answerText.textContent = answer;
                
                const answerCount = document.createElement('span');
                answerCount.className = 'answer-count';
                answerCount.textContent = `= ${count}`;
                
                answerLine.appendChild(answerText);
                answerLine.appendChild(answerCount);
                resultItem.appendChild(answerLine);
            }
        } else {
            const noData = document.createElement('p');
            noData.textContent = 'No responses yet';
            noData.style.color = '#999';
            noData.style.fontStyle = 'italic';
            resultItem.appendChild(noData);
        }
        
        container.appendChild(resultItem);
    }
}

// Export results to CSV
function exportResults() {
    let csv = 'Question,Answer,Count,Percentage\n';
    
    const tallied = surveyResults.tallied || {};
    
    for (let q in questions) {
        const questionText = questions[q].text.replace(/,/g, ';');
        const answers = tallied[q] || {};
        
        for (let answer in answers) {
            const count = answers[answer];
            const percentage = surveyResults.totalResponses > 0 
                ? ((count / surveyResults.totalResponses) * 100).toFixed(1) 
                : 0;
            
            csv += `"${questionText}","${answer}",${count},${percentage}%\n`;
        }
    }
    
    // Add total responses
    csv += `\nTotal Responses,${surveyResults.totalResponses}`;
    
    // Download CSV file
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `disaster_survey_results_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
}

// Clear all data
async function clearAllData() {
    if (confirm('Are you sure you want to clear all survey data? This cannot be undone.')) {
        try {
            // Delete the JSON file by creating a new empty one
            const response = await fetch('clear-survey.php', { method: 'POST' });
            const result = await response.json();
            
            if (result.success) {
                await loadResults();
                alert('All data has been cleared.');
            } else {
                alert('Error clearing data.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error clearing data.');
        }
    }
}

// Show success message
function showSuccessMessage() {
    const message = document.createElement('div');
    message.className = 'success-message';
    message.textContent = '✓ Response saved to database successfully!';
    document.body.appendChild(message);
    
    setTimeout(() => {
        message.remove();
    }, 3000);
}
