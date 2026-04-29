using UnityEngine;
using UnityEngine.Networking;
using System.Collections;
using TMPro;

public class TursoManager : MonoBehaviour
{
    [Header("Configurazione Database")]
    // ATTENZIONE: verifica che il nome del database sia corretto nel tuo account Turso
    public string dbUrl = "https://metafan-maarcotoselli.aws-eu-west-1.turso.io/v2/pipeline";
    public string apiToken = "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NzI3OTUyOTYsImlkIjoiMDE5Y2MyOGUtZDMwMS03YzYxLTg4YjUtMzFiMWY3N2ZjZmY5IiwicmlkIjoiZjExMDg3YzItMGYyOC00MzNmLTkyZTUtZjZkNTUyMTc0ODE0In0.hBgc2nqYNvNptQ7761MM-PfU19jmczo7UX7p-UlQUqUifQbafThs9oWILQIW3BWffD8ghK3k8qAkO0Pzd9m4BQ";

    [Header("Riferimenti UI")]
    public TextMeshProUGUI displayTesto;

    void Awake()
    {
        // Verifica che displayTesto sia assegnato dall'Inspector
        if (displayTesto == null)
            displayTesto = GetComponentInChildren<TextMeshProUGUI>();

        if (displayTesto != null)
            displayTesto.text = "TursoManager avviato...";
        else
            Debug.LogError("[TursoManager] displayTesto non trovato! Assegnalo nell'Inspector.");
    }

    void Start()
    {
        if (displayTesto == null)
        {
            Debug.LogError("[TursoManager] Impossibile procedere: displayTesto e' null.");
            return;
        }
        StartCoroutine(GetData());
    }

    IEnumerator GetData()
    {
        displayTesto.text = "Connessione a:\n" + dbUrl + "\n\nIn corso...";

        string jsonBody = "{\"requests\": [{\"type\": \"execute\", \"stmt\": {\"sql\": \"SELECT * FROM rilevazione_processo LIMIT 10;\"}}, {\"type\": \"close\"}]}";
        byte[] bodyRaw = System.Text.Encoding.UTF8.GetBytes(jsonBody);

        using (UnityWebRequest request = new UnityWebRequest(dbUrl, "POST"))
        {
            request.uploadHandler = new UploadHandlerRaw(bodyRaw);
            request.downloadHandler = new DownloadHandlerBuffer();
            request.SetRequestHeader("Content-Type", "application/json");
            request.SetRequestHeader("Authorization", "Bearer " + apiToken);

            yield return request.SendWebRequest();

            long responseCode = request.responseCode;
            Debug.Log("[TursoManager] Response code: " + responseCode);

            if (request.result == UnityWebRequest.Result.Success)
            {
                string risultato = request.downloadHandler.text;
                Debug.Log("[TursoManager] Dati ricevuti: " + risultato);
                displayTesto.text = "OK (" + responseCode + "):\n" + risultato;
            }
            else
            {
                string erroreBody = request.downloadHandler != null ? request.downloadHandler.text : "(nessun body)";
                Debug.LogError("[TursoManager] Errore " + responseCode + ": " + request.error + "\n" + erroreBody);
                displayTesto.text = "ERRORE HTTP " + responseCode + "\n"
                    + request.error + "\n\n"
                    + "URL: " + dbUrl + "\n\n"
                    + "Body risposta:\n" + erroreBody;
            }
        }
    }
}