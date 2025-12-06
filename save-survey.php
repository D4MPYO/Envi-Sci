<?php
header('Content-Type: application/json');

// JSON file path
$jsonFile = 'survey-results.json';

// Read existing data
$data = [];
if (file_exists($jsonFile)) {
    $jsonContent = file_get_contents($jsonFile);
    $data = json_decode($jsonContent, true);
    if ($data === null) {
        $data = [];
    }
}

// Initialize if empty
if (empty($data)) {
    $data = [
        'totalResponses' => 0,
        'responses' => []
    ];
}

// Get POST data
$input = json_decode(file_get_contents('php://input'), true);

if ($input && isset($input['answers'])) {
    // Add new response
    $data['responses'][] = [
        'timestamp' => date('Y-m-d H:i:s'),
        'answers' => $input['answers']
    ];
    
    $data['totalResponses']++;
    
    // Save to JSON file
    file_put_contents($jsonFile, json_encode($data, JSON_PRETTY_PRINT));
    
    echo json_encode([
        'success' => true,
        'message' => 'Response saved successfully',
        'totalResponses' => $data['totalResponses']
    ]);
} else {
    echo json_encode([
        'success' => false,
        'message' => 'Invalid data'
    ]);
}
?>
