<?php
header('Content-Type: application/json');

$jsonFile = 'survey-results.json';

// Read and return results
if (file_exists($jsonFile)) {
    $jsonContent = file_get_contents($jsonFile);
    $data = json_decode($jsonContent, true);
    
    if ($data === null) {
        echo json_encode([
            'totalResponses' => 0,
            'tallied' => []
        ]);
        exit;
    }
    
    // Tally all responses
    $tallied = [];
    
    foreach ($data['responses'] as $response) {
        foreach ($response['answers'] as $question => $answers) {
            if (!isset($tallied[$question])) {
                $tallied[$question] = [];
            }
            
            // Handle both single and multiple answers
            if (is_array($answers)) {
                foreach ($answers as $answer) {
                    if (!isset($tallied[$question][$answer])) {
                        $tallied[$question][$answer] = 0;
                    }
                    $tallied[$question][$answer]++;
                }
            } else {
                if (!isset($tallied[$question][$answers])) {
                    $tallied[$question][$answers] = 0;
                }
                $tallied[$question][$answers]++;
            }
        }
    }
    
    echo json_encode([
        'totalResponses' => $data['totalResponses'],
        'tallied' => $tallied
    ]);
} else {
    echo json_encode([
        'totalResponses' => 0,
        'tallied' => []
    ]);
}
?>
