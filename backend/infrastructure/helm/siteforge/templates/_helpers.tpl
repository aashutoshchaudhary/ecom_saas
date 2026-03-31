{{/*
Expand the name of the chart.
*/}}
{{- define "siteforge.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
*/}}
{{- define "siteforge.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "siteforge.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "siteforge.labels" -}}
helm.sh/chart: {{ include "siteforge.chart" . }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
app.kubernetes.io/part-of: siteforge
{{- end }}

{{/*
Service-specific labels
*/}}
{{- define "siteforge.serviceLabels" -}}
{{ include "siteforge.labels" . }}
app.kubernetes.io/name: {{ .serviceName }}
app.kubernetes.io/instance: {{ .release }}
app.kubernetes.io/version: {{ .appVersion | quote }}
{{- end }}

{{/*
Selector labels for a service
*/}}
{{- define "siteforge.selectorLabels" -}}
app.kubernetes.io/name: {{ .serviceName }}
app.kubernetes.io/instance: {{ .release }}
{{- end }}

{{/*
Create the name of the service account to use
*/}}
{{- define "siteforge.serviceAccountName" -}}
{{- if .Values.serviceAccount.create }}
{{- default (include "siteforge.fullname" .) .Values.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.serviceAccount.name }}
{{- end }}
{{- end }}

{{/*
Generate image reference
*/}}
{{- define "siteforge.image" -}}
{{- $registry := .global.imageRegistry | default .image.registry -}}
{{- $tag := .image.tag | default .global.tag | default "latest" -}}
{{- if $registry -}}
{{- printf "%s/%s:%s" $registry .image.repository $tag -}}
{{- else -}}
{{- printf "%s:%s" .image.repository $tag -}}
{{- end -}}
{{- end }}
