---
id: 10-andruia-skill-smith
name: 10-andruia-skill-smith
description: "Usar para crear o mejorar una skill de Andru.ia: define entradas y resultados, redacta SKILL.md con ejemplos y límites, valida la estructura y prepara una PR."
category: andruia
risk: safe
source: personal
date_added: "2026-02-25"
---

# 🔨 Andru.ia Skill-Smith (The Forge)

## When to Use
Usar cuando el usuario solicita crear o mejorar una skill con un objetivo concreto, entradas, resultados y criterios de validación; no para instalar o publicar automáticamente un paquete.

## 📝 Descripción
Convertir un objetivo repetible en instrucciones utilizables de Andru.ia, con entradas, resultados y límites concretos. Redactar la skill no la instala ni publica.

## 📋 Instrucciones Generales
- **Idioma Mandatorio:** Redactar en **ESPAÑOL** por defecto, respetando el idioma solicitado por el usuario y las convenciones del repositorio destino.
- **Estructura Formal:** Debo seguir la anatomía de carpeta -> SKILL.md -> validación.
- **Calidad Senior:** Las skills generadas no deben ser genéricas; deben tener un rol experto definido.

## 🛠️ Flujo de Trabajo (Protocolo de Forja)

### FASE 1: ADN de la Skill
Solicitar al usuario los 3 pilares de la nueva habilidad:
1. **Nombre Técnico:** (Ej: @cyber-sec, @data-visualizer).
2. **Rol Experto:** (¿Quién es esta IA? Ej: "Un experto en auditoría de seguridad").
3. **Outputs Clave:** (¿Qué archivos o acciones específicas debe realizar?).

### FASE 2: Materialización
Generar el código para los siguientes archivos:
- **SKILL.md Personalizado:** Con descripción, capacidades, reglas de oro y modo de uso.
- **Resumen para la PR:** Descripción del objetivo, archivos modificados y validaciones; no editar los registros generados a mano.

### FASE 3: Despliegue e Integración
1. Localizar la raíz del repositorio y crear `skills/<skill-id>/` con un ID en minúsculas y guiones.
2. Escribir `SKILL.md` siguiendo `docs/contributors/skill-template.md`, con frontmatter y secciones de uso, ejemplos y límites.
3. Leer las instrucciones y `package.json` de la base actual. En AAS, ejecutar `npm run chain`, `npm run validate:references`, `npm run security:docs` y `npm run test` antes de proponer la PR; en otro destino, usar sus comprobaciones vigentes sin inventar comandos.
4. Si una comprobación falla, corregir el origen y repetirla. No debilitar validadores, marcar un ejemplo no ejecutado como probado ni continuar al merge con fallos pendientes. Proponer la PR de fuentes cuando las comprobaciones pasen; los registros generados pertenecen al flujo de sincronización canónica.

## ⚠️ Reglas de Oro
- **Prefijos Numéricos:** Mantener IDs existentes. Para nuevas skills, elegir un ID descriptivo en minúsculas y guiones según el repositorio; no imponer un prefijo numérico de Andru.ia a otros proyectos.
- **Prompt Engineering:** Incluir ejemplos de entrada y salida observables y criterios de comprobación. Pedir una explicación breve de decisiones cuando sea útil, sin exigir razonamiento interno privado ni prometer precisión máxima.

## Example

**User request:**

> Crea una skill `csv-quality-check` que informe valores ausentes y duplicados sin modificar el CSV.

**Diseño ilustrativo:** Entradas: ruta autorizada, delimitador y columnas clave. Resultado: informe con número de filas, valores ausentes por columna y claves repetidas. Ejemplo: las filas `id,name` / `1,Ana` / `1,` producen una clave duplicada y un nombre ausente; el CSV permanece intacto. Un delimitador ambiguo se registra como entrada no resuelta, no como informe limpio. La skill documenta límites de tamaño, privacidad y codificación, y se presenta en una PR con las comprobaciones exigidas por la base actual.

## Limitations
- Use this skill only when the task clearly matches the scope described above.
- Do not treat the output as a substitute for environment-specific validation, testing, or expert review.
- Crear el texto no prueba que los ejemplos funcionen: verificar los ejemplos ejecutables y los recursos incluidos cuando existan.
- No instalar, publicar ni alterar políticas del repositorio como consecuencia implícita de redactar una skill.
