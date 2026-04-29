using UnityEngine;
using UnityEngine.Networking;
using System.Collections;
using TMPro; // Necessario per usare TextMeshPro (il testo di alta qualità per VR)

public class TursoManager : MonoBehaviour
{
    [Header("Configurazione Database")]
    public string dbUrl = "https://metafan-maarcotoselli.aws-eu-west-1.turso.io/v2/pipeline";
    public string apiToken = "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NzI3OTUyOTYsImlkIjoiMDE5Y2MyOGUtZDMwMS03YzYxLTg4YjUtMzFiMWY3N2ZjZmY5IiwicmlkIjoiZjExMDg3YzItMGYyOC00MzNmLTkyZTUtZjZkNTUyMTc0ODE0In0.hBgc2nqYNvNptQ7761MM-PfU19jmczo7UX7p-UlQUqUifQbafThs9oWILQIW3BWffD8ghK3k8qAkO0Pzd9m4BQ";

    [Header("Riferimenti UI")]
    public TextMeshProUGUI displayTesto; // Trascinerai qui l'oggetto testo della stanza

    void Start()
    {
        // Per ora lo lanciamo all'avvio
        StartCoroutine(GetData());
    }

    IEnumerator GetData()
    {
        // 1. Prepariamo la query nel formato Turso v2/pipeline
        string jsonBody = "{\"requests\": [{\"type\": \"execute\", \"stmt\": {\"sql\": \"SELECT * FROM rilevazione_processo LIMIT 10;\"}}, {\"type\": \"close\"}]}";
        byte[] bodyRaw = System.Text.Encoding.UTF8.GetBytes(jsonBody);

        using (UnityWebRequest request = new UnityWebRequest(dbUrl, "POST"))
        {
            request.uploadHandler = new UploadHandlerRaw(bodyRaw);
            request.downloadHandler = new DownloadHandlerBuffer();
            
            request.SetRequestHeader("Content-Type", "application/json");
            request.SetRequestHeader("Authorization", "Bearer " + apiToken);

            displayTesto.text = "Connessione in corso...";

            yield return request.SendWebRequest();

            if (request.result == UnityWebRequest.Result.Success)
            {
                // Qui riceviamo il JSON grezzo
                string risultato = request.downloadHandler.text;
                Debug.Log("Dati ricevuti: " + risultato);

                // Mostriamo il JSON nel visore per testare che funzioni
                displayTesto.text = "Dati ricevuti:\n" + risultato;
            }
            else
            {
                displayTesto.text = "Errore: " + request.error;
            }
        }
    }
}