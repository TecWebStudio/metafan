# **************** #
# IMPORT PACCHETTI #
# **************** #

import logging
import json
from datetime import datetime
from urllib import request, error
from dataclasses import dataclass
from typing import List
from opcua import Client, ua  # type: ignore
from opcua.ua import DataValue  # type: ignore

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
log = logging.getLogger(__name__)


# *************************** #
#  MAPPATURA REGISTRI E STATI #
# *************************** #

@dataclass
class RegMap:
    register: int    # indirizzo holding register Modbus
    decode: str    # "int16" o "uint16"
    opc_node: str    # node ID OPC UA completo dove scrivere
    description: str

NODE_STATUS = 'ns=3;s="STATI ROBOT"."STATO SISTEMA"'
OPC_URL = "opc.tcp://192.168.139.80:4840"
POLL_INTERVAL = 1.0
MODBUS_TIMEOUT = 3
RECONNECT_DELAY = 5.0
MAX_RECONNECT_ATTEMPTS = 0   # infinito
TURSO_DB_URL = "https://metafan-maarcotoselli.aws-eu-west-1.turso.io"
TURSO_AUTH_TOKEN = "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NzI3OTUyOTYsImlkIjoiMDE5Y2MyOGUtZDMwMS03YzYxLTg4YjUtMzFiMWY3N2ZjZmY5IiwicmlkIjoiZjExMDg3YzItMGYyOC00MzNmLTkyZTUtZjZkNTUyMTc0ODE0In0.hBgc2nqYNvNptQ7761MM-PfU19jmczo7UX7p-UlQUqUifQbafThs9oWILQIW3BWffD8ghK3k8qAkO0Pzd9m4BQ"

# Mappa: descrizione registro → id_parametro in parametro_processo
REGISTER_PARAM_MAP = {
    "Robot Mode":           "ROBOT_MODE",
    "is PowerOn":           "ROBOT_POWERON",
    "isSecurityStopped":    "ROBOT_SECSTOPPED",
    "isEmergencyStopped":   "ROBOT_EMSTOPPED",
    "isTeachButtonPressed": "ROBOT_TEACH",
    "isPowerButtonPressed": "ROBOT_POWERBTN",
    "isSafetySignalStatus": "ROBOT_SAFETY",
}

# id_linea in lineaproduzione associato a ogni robot
ROBOT_LINE_MAP = {
    "UR3_Robot_1": 1,
}


# ******************** #
# CONFIGURAZIONE ROBOT #
# ******************** #

@dataclass
class RobotConfig:
    name: str
    host: str
    port: int
    unit_id: int
    registers: List[RegMap]
    opc_node_conn: str   # nodo OPC UA → stato connessione (0/1)
    opc_node_reconn: str   # nodo OPC UA → contatore tentativi riconnessione
    opc_type: str   # "Int16" o "Int32"

ROBOTS_CONFIG = [
    RobotConfig(
        name = "UR3_Robot_1",
        host = "192.168.139.98", 
        port = 502,   # porta Modbus TCP per comunicazione
        unit_id = 1,
        opc_type = "Int16",
        opc_node_conn = 'ns=3;s="STATI ROBOT"."ROBOT_SX"[7]',
        opc_node_reconn = 'ns=3;s="STATI ROBOT"."ROBOT_SX"[8]',
        registers = [
            RegMap(258, "int16", 'ns=3;s="STATI ROBOT"."ROBOT_SX"[0]', "Robot Mode"),
            RegMap(260, "int16", 'ns=3;s="STATI ROBOT"."ROBOT_SX"[1]', "is PowerOn"),
            RegMap(261, "int16", 'ns=3;s="STATI ROBOT"."ROBOT_SX"[2]', "isSecurityStopped"),
            RegMap(262, "int16", 'ns=3;s="STATI ROBOT"."ROBOT_SX"[3]', "isEmergencyStopped"),
            RegMap(263, "int16", 'ns=3;s="STATI ROBOT"."ROBOT_SX"[4]', "isTeachButtonPressed"),
            RegMap(264, "int16", 'ns=3;s="STATI ROBOT"."ROBOT_SX"[5]', "isPowerButtonPressed"),
            RegMap(265, "int16", 'ns=3;s="STATI ROBOT"."ROBOT_SX"[6]', "isSafetySignalStatus"),
        ]
    ),
]


# ******************** #
#  FUNZIONI PRINCIPALI #
# ******************** #

def variantType(opc_type):
    if isinstance(opc_type, ua.VariantType):
        return opc_type
    if isinstance(opc_type, str):
        return ua.VariantType[opc_type]
    raise TypeError(f"opc_type non valido: {opc_type}")


def getExistingNode(opc_client, node_id: str, fallback_path=None):
    try:
        node = opc_client.get_node(node_id)
        node.get_node_class()
        return node
    except Exception as e:
        if fallback_path:
            try:
                node = opc_client.get_root_node().get_child(fallback_path)
                node.get_node_class()
                log.info("Fallback path OK per '%s' -> %s", node_id, node.nodeid)
                return node
            except Exception:
                pass
        raise RuntimeError(f"Nodo non trovato: {node_id}") from e


# ************** #
# SCRITTURA NODO #
# ************** #

def writeNode(node, value: int, opc_type, label: str = ""):
    try:
        variant_type = variantType(opc_type)
        dv = DataValue()
        dv.Value = ua.Variant(value, variant_type)
        node.set_value(dv)
        log.info("Write OK '%s': %s", label or str(node.nodeid), value)
    except Exception as e:
        log.warning("OPC write '%s' fallita: %s", label, e)


def writeConnStatus(node_conn, node_reconn, connected: bool, reconnect_attempts: int, opc_type):
    writeNode(node_conn, 1 if connected else 0, opc_type, "conn_status")
    writeNode(node_reconn, reconnect_attempts, opc_type, "reconn_count")


def setup_opc_nodes(opc_client, config: RobotConfig):
    nodes = {}
    for rm in config.registers:
        nodes[rm.opc_node] = getExistingNode(opc_client, rm.opc_node)

    node_conn = getExistingNode(opc_client, config.opc_node_conn)
    node_reconn = getExistingNode(opc_client, config.opc_node_reconn)

    log.info("[%s] Nodi OPC UA pronti: %d dati + conn + reconn", config.name, len(config.registers))
    return nodes, node_conn, node_reconn


def turso_arg(value):
    if value is None:
        return {"type": "null"}
    if isinstance(value, bool):
        return {"type": "integer", "value": "1" if value else "0"}
    if isinstance(value, int):
        return {"type": "integer", "value": str(value)}
    if isinstance(value, float):
        return {"type": "float", "value": str(value)}
    return {"type": "text", "value": str(value)}


def turso_exec(sql: str, args=None):
    stmt = {"sql": sql}
    if args:
        stmt["args"] = [turso_arg(v) for v in args]

    payload = json.dumps(
        {
            "requests": [
                {"type": "execute", "stmt": stmt},
                {"type": "close"},
            ]
        }
    ).encode("utf-8")

    req = request.Request(
        TURSO_DB_URL.rstrip("/") + "/v2/pipeline",
        data=payload,
        headers={
            "Authorization": f"Bearer {TURSO_AUTH_TOKEN}",
            "Content-Type": "application/json",
        },
        method="POST",
    )

    try:
        with request.urlopen(req, timeout=8) as resp:
            body = resp.read().decode("utf-8")
    except error.HTTPError as e:
        detail = e.read().decode("utf-8", errors="ignore")
        raise RuntimeError(f"Turso HTTP {e.code}: {detail}") from e
    except Exception as e:
        raise RuntimeError(f"Errore connessione Turso: {e}") from e

    data = json.loads(body)
    first = (data.get("results") or [{}])[0]
    if first.get("type") == "error":
        msg = (first.get("error") or {}).get("message", "Unknown")
        raise RuntimeError(f"Turso query error: {msg}")
    return first.get("response", {}).get("result", {})


def save_robot_readings_to_db(config: RobotConfig, values_by_desc: dict):
    """Inserisce una riga in rilevazione_processo per ogni registro letto dal robot."""
    now = datetime.now().strftime("%Y-%m-%dT%H:%M:%S")
    id_linea = ROBOT_LINE_MAP.get(config.name, 1)

    sql = (
        "INSERT INTO rilevazione_processo "
        "(id_linea, id_parametro, valore, timestamp) "
        "VALUES (?, ?, ?, ?)"
    )

    saved = 0
    for description, value in values_by_desc.items():
        id_parametro = REGISTER_PARAM_MAP.get(description)
        if id_parametro is None:
            log.warning("[%s] Parametro sconosciuto '%s', saltato", config.name, description)
            continue
        try:
            turso_exec(sql, [id_linea, id_parametro, value, now])
            saved += 1
        except Exception as e:
            log.warning("[%s] Salvataggio '%s' fallito: %s", config.name, description, e)

    log.info("[%s] %d rilevazioni salvate su Turso (rilevazione_processo)", config.name, saved)


client = Client(OPC_URL)

try:
    client.connect()
    log.info("Connesso al server OPC UA: %s", OPC_URL)
    node_system = getExistingNode(client, NODE_STATUS)

    for cfg in ROBOTS_CONFIG:
        log.info("── Setup robot: %s ──", cfg.name)
        opc_type = variantType(cfg.opc_type)
        robot_values = {}

        nodes, node_conn, node_reconn = setup_opc_nodes(client, cfg)
        writeConnStatus(node_conn, node_reconn, connected=True, reconnect_attempts=0, opc_type=opc_type)

        for rm in cfg.registers:
            current = nodes[rm.opc_node].get_value()
            try:
                robot_values[rm.description] = int(current)
            except Exception:
                robot_values[rm.description] = 0
            log.info("[%s] %s — valore letto: %s", cfg.name, rm.description, current)
            writeNode(nodes[rm.opc_node], 0, opc_type, f"{cfg.name}/{rm.description}")

        save_robot_readings_to_db(cfg, robot_values)

    writeNode(node_system, 0, variantType(ROBOTS_CONFIG[0].opc_type), "STATO SISTEMA")
    log.info("Scrittura completata per tutti i robot.")

except Exception as e:
    log.error("Errore: %s", e)
finally:
    client.disconnect()
    log.info("Disconnesso dal server OPC UA.")


# ********** #
# DI METAFAN #
# ********** #