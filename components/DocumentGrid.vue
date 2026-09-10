<script setup lang="ts">
import { computed, reactive } from 'vue'
import { MAX_UPLOAD_KILOBYTES } from '~/data/documents'
import type { Procurement } from '~/data/demo'

/**
 * The supporting-document cards for one Purchase Request.
 *
 * The requester page passes a Purchase Request it may change; the admin review
 * passes `readonly` and gets the same cards without the file inputs.
 *
 * There is no disk behind this build, so choosing a file records its name and
 * the card reports it as uploaded. Nothing is transmitted anywhere.
 */
const props = withDefaults(
    defineProps<{ procurement: Procurement; readonly?: boolean }>(),
    { readonly: false },
)

const store = usePurchaseRequestStore()
const modal = usePimsModal()

const documents = computed(() => store.documentList(props.procurement))

const requiredDocuments = computed(() => documents.value.filter((document) => document.required))
const requiredUploaded = computed(() => requiredDocuments.value.filter((doc) => doc.stored).length)
const uploadedCount = computed(() => documents.value.filter((doc) => doc.stored).length)
const extraDocuments = computed(() => documents.value.filter((doc) => !doc.applicable).length)

const completion = computed(() => {
    if (requiredDocuments.value.length > 0) {
        return Math.round((requiredUploaded.value / requiredDocuments.value.length) * 100)
    }

    return uploadedCount.value > 0 ? 100 : 0
})

const maxUploadMegabytes = Math.floor(MAX_UPLOAD_KILOBYTES / 1024)

const hasPrType = computed(() => props.procurement.pr_type_id !== null)

const isLateFiling = computed(() => store.requiresLateJustification(props.procurement))
const daysUntilDateRequired = computed(() => store.daysUntilDateRequired(props.procurement))

const lateHeadline = computed(() => {
    const days = daysUntilDateRequired.value

    if (days === null) {
        return ''
    }

    if (days < 0) {
        return 'The Date Required/Needed has already passed.'
    }

    if (days === 0) {
        return 'The Date Required/Needed is today.'
    }

    return `${days} ${plural('day', days)} left until the Date Required/Needed.`
})

/** Per-card errors raised by the client-side size and extension checks. */
const errors = reactive<Record<string, string>>({})

const ALLOWED_EXTENSIONS = ['pdf', 'doc', 'docx']

function onFileChosen(field: string, label: string, event: Event): void {
    const input = event.target as HTMLInputElement
    const file = input.files?.[0]

    delete errors[field]

    if (!file) {
        return
    }

    const extension = file.name.split('.').pop()?.toLowerCase() ?? ''

    if (!ALLOWED_EXTENSIONS.includes(extension)) {
        errors[field] = `${label} must be a PDF, DOC or DOCX file.`
        input.value = ''

        return
    }

    if (file.size > MAX_UPLOAD_KILOBYTES * 1024) {
        errors[field] = `${label} may not be larger than ${maxUploadMegabytes} MB.`
        input.value = ''

        return
    }

    store.storeDocument(props.procurement.id, field, file.name)
    input.value = ''

    modal.success(`${label} uploaded successfully`)
}

async function remove(field: string, label: string): Promise<void> {
    const confirmed = await modal.confirm({
        title: 'Remove this document?',
        text: `${label} will be removed from this Purchase Request.`,
        confirmText: 'Remove',
        variant: 'danger',
    })

    if (!confirmed) {
        return
    }

    store.removeDocument(props.procurement.id, field)
    modal.success(`${label} removed successfully`)
}

function fileIcon(name: string | null): string {
    const extension = name?.split('.').pop()?.toLowerCase()

    if (extension === 'pdf') {
        return 'fa-file-pdf text-danger'
    }

    if (extension === 'doc' || extension === 'docx') {
        return 'fa-file-word text-primary'
    }

    return 'fa-file-alt text-muted'
}

function cardState(document: { stored: boolean; required: boolean; applicable: boolean }, field: string): string {
    const classes: string[] = []

    if (errors[field]) {
        classes.push('is-invalid')
    } else if (document.stored) {
        classes.push('is-uploaded')
    } else if (document.required) {
        classes.push('is-required')
    }

    if (!document.applicable) {
        classes.push('is-out-of-type')
    }

    return classes.join(' ')
}
</script>

<template>
    <div class="card">
        <div class="card-header">
            <div class="row align-items-center">
                <div class="col-md-7">
                    <h5 class="h3 mb-0">List of Required Documents</h5>

                    <p class="text-sm text-muted mb-0">
                        <template v-if="hasPrType">
                            Purchase Request Type:
                            <strong>{{ store.prTypeName(procurement.pr_type_id) }}</strong>.
                        </template>

                        <i>
                            <br />Accepted formats: PDF, DOC or DOCX &mdash; up to
                            {{ maxUploadMegabytes }} MB per document.
                        </i>
                    </p>
                </div>

                <div class="col-md-5 mt-3 mt-md-0">
                    <div class="d-flex align-items-center justify-content-md-end">
                        <span v-if="requiredDocuments.length > 0" class="badge badge-pill badge-success mr-2">
                            {{ requiredUploaded }} of {{ requiredDocuments.length }} required
                        </span>

                        <span class="badge badge-pill badge-secondary">
                            {{ uploadedCount }} of {{ documents.length }} uploaded
                        </span>
                    </div>

                    <div class="progress progress-xs mt-2 mb-0">
                        <div
                            class="progress-bar bg-success"
                            role="progressbar"
                            :style="{ width: `${completion}%` }"
                        ></div>
                    </div>
                </div>
            </div>
        </div>

        <div class="card-body">
            <div v-if="!hasPrType" class="alert alert-warning">
                <strong>
                    <i class="fas fa-exclamation-triangle mr-1"></i>
                    No PR Type is set for this Purchase Request.
                </strong>

                <p class="mb-0 mt-1 text-sm">
                    The list of required documents depends on the PR Type, so only the Justification
                    Letter is shown. Set the PR Type on the
                    <NuxtLink :to="`/PIMS/purchase-request/${procurement.id}/edit`">edit page</NuxtLink>
                    to see the documents this request needs.
                </p>
            </div>

            <div v-if="isLateFiling" class="alert alert-warning">
                <strong><i class="fas fa-clock mr-1"></i> {{ lateHeadline }}</strong>

                <p class="mb-0 mt-1 text-sm">
                    This PR Type expects at least 30 days of lead time, so a Late Justification
                    Letter is required before this Purchase Request can be submitted.
                </p>
            </div>

            <div v-if="extraDocuments > 0" class="alert alert-info">
                <strong>
                    <i class="fas fa-info-circle mr-1"></i>
                    {{ extraDocuments }} {{ plural('document', extraDocuments) }} outside this PR Type
                    {{ extraDocuments === 1 ? 'is' : 'are' }} already uploaded.
                </strong>

                <p class="mb-0 mt-1 text-sm">
                    {{ extraDocuments === 1 ? 'It is' : 'They are' }} listed last so
                    {{ extraDocuments === 1 ? 'it' : 'they' }} can still be viewed or removed. Newly
                    uploaded files are limited to the documents this PR Type calls for.
                </p>
            </div>

            <div class="doc-grid">
                <div
                    v-for="document in documents"
                    :key="document.field"
                    class="doc-card"
                    :class="cardState(document, document.field)"
                >
                    <div class="doc-card__head">
                        <div>
                            <label class="doc-card__title" :for="`document-${document.field}`">
                                {{ document.label }}
                            </label>

                            <div class="doc-card__tag">
                                <span v-if="!document.applicable" class="text-muted">
                                    <i class="fas fa-info-circle"></i>
                                    Not required for this PR type
                                </span>
                                <span v-else-if="document.required" class="text-danger">
                                    <i class="fas fa-asterisk"></i> Required
                                </span>
                                <span v-else class="text-muted">Optional</span>
                            </div>
                        </div>

                        <span v-if="document.stored" class="badge badge-success">Uploaded</span>
                        <span v-else-if="document.required" class="badge badge-danger">Missing</span>
                        <span v-else class="badge badge-secondary">No file</span>
                    </div>

                    <div class="doc-card__body">
                        <template v-if="document.stored">
                            <div class="doc-card__file">
                                <i class="fas doc-card__icon" :class="fileIcon(document.name)"></i>

                                <div>
                                    <div class="doc-card__name">{{ document.name }}</div>
                                    <div class="doc-card__meta">
                                        {{ (document.name?.split('.').pop() ?? '').toUpperCase() }}
                                    </div>
                                </div>
                            </div>

                            <div v-if="!readonly" class="doc-card__actions">
                                <button
                                    type="button"
                                    class="btn btn-sm btn-outline-danger"
                                    @click="remove(document.field, document.label)"
                                >
                                    <i class="fas fa-trash-alt mr-1"></i> Remove
                                </button>
                            </div>
                        </template>

                        <div v-else class="doc-card__empty">
                            <i class="far fa-file"></i>
                            No document uploaded yet
                        </div>

                        <div v-if="!readonly" class="doc-card__upload">
                            <input
                                :id="`document-${document.field}`"
                                type="file"
                                class="form-control doc-card__input"
                                accept=".pdf,.doc,.docx"
                                @change="onFileChosen(document.field, document.label, $event)"
                            />

                            <span class="doc-card__hint">
                                {{
                                    document.stored
                                        ? 'Choose a file to replace the current one.'
                                        : 'PDF, DOC or DOCX'
                                }}
                                &middot; max {{ maxUploadMegabytes }} MB
                            </span>

                            <div v-if="errors[document.field]" class="doc-card__error">
                                <i class="fas fa-exclamation-circle mr-1"></i>
                                {{ errors[document.field] }}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="card-footer bg-transparent text-center mt-3">
                <NuxtLink :to="`/PIMS/purchase-request/${procurement.id}`" class="btn btn-secondary">
                    Back
                </NuxtLink>
            </div>
        </div>
    </div>
</template>

<style scoped>
.doc-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 1rem;
}

.doc-card {
    display: flex;
    flex-direction: column;
    border: 1px solid #e9ecef;
    border-left: 3px solid #dee2e6;
    border-radius: 0.375rem;
    background-color: #fff;
    transition:
        border-color 0.15s ease-in-out,
        box-shadow 0.15s ease-in-out;
}

.doc-card:hover {
    border-color: #ced4da;
    box-shadow: 0 0.25rem 0.5rem rgba(50, 50, 93, 0.07);
}

.doc-card.is-uploaded {
    border-left-color: #2dce89;
}

.doc-card.is-invalid {
    border-left-color: #f5365c;
}

.doc-card.is-required {
    border-left-color: #fdd8dd;
}

.doc-card.is-out-of-type {
    background-color: #fbfcfe;
    border-style: dashed;
}

.doc-card__tag {
    margin-top: 0.1875rem;
    font-size: 0.625rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.02em;
}

.doc-card__tag .fa-asterisk {
    font-size: 0.5rem;
    vertical-align: middle;
}

.doc-card__head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    border-bottom: 1px solid #f1f3f7;
}

.doc-card__title {
    margin: 0;
    font-size: 0.8125rem;
    font-weight: 600;
    line-height: 1.35;
    color: #32325d;
}

.doc-card__body {
    display: flex;
    flex: 1 1 auto;
    flex-direction: column;
    gap: 0.75rem;
    padding: 0.875rem 1rem 1rem;
}

.doc-card__file {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    min-width: 0;
    padding: 0.5rem 0.625rem;
    border-radius: 0.25rem;
    background-color: #f6f9fc;
}

.doc-card__icon {
    flex: 0 0 auto;
    font-size: 1.375rem;
    line-height: 1;
}

.doc-card__name {
    font-size: 0.75rem;
    font-weight: 600;
    color: #32325d;
    word-break: break-all;
}

.doc-card__meta {
    font-size: 0.6875rem;
    color: #8898aa;
}

.doc-card__empty {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.625rem;
    border: 1px dashed #dee2e6;
    border-radius: 0.25rem;
    font-size: 0.75rem;
    font-style: italic;
    color: #adb5bd;
}

.doc-card__actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.375rem;
}

.doc-card__upload {
    margin-top: auto;
}

.doc-card__input {
    height: auto;
    padding: 0.375rem 0.5rem;
    font-size: 0.75rem;
}

.doc-card__hint {
    display: block;
    margin-top: 0.375rem;
    font-size: 0.6875rem;
    color: #8898aa;
}

.doc-card__error {
    margin-top: 0.375rem;
    font-size: 0.6875rem;
    color: #f5365c;
}
</style>
