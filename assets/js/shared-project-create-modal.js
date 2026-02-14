function ensureSharedProjectCreateModal() {
  var existing = document.getElementById("project-create-modal");
  if (existing) {
    existing.remove();
  }

  var wrapper = document.createElement("div");
  wrapper.innerHTML = `
    <div id="project-create-modal" class="project-create-modal hidden" aria-hidden="true">
      <div class="project-create-modal__backdrop" data-project-modal-close></div>
      <div class="project-create-modal__dialog" role="dialog" aria-modal="true" aria-labelledby="project-create-title">
        <div class="project-stepper" data-project-stepper>
          <div class="project-stepper__track"></div>
          <div class="project-stepper__progress" id="project-stepper-progress"></div>
          <div class="project-stepper__steps">
            <div class="project-step is-active" data-step-index="1">
              <div class="project-step__circle">
                <span class="step-num">1</span>
                <span class="material-icons-outlined step-check">check</span>
              </div>
              <span class="project-step__label">Basic Info</span>
            </div>
            <div class="project-step" data-step-index="2">
              <div class="project-step__circle">
                <span class="step-num">2</span>
                <span class="material-icons-outlined step-check">check</span>
              </div>
              <span class="project-step__label">Client</span>
            </div>
            <div class="project-step" data-step-index="3">
              <div class="project-step__circle">
                <span class="step-num">3</span>
                <span class="material-icons-outlined step-check">check</span>
              </div>
              <span class="project-step__label">Budget</span>
            </div>
          </div>
        </div>
        <form id="project-create-form" class="project-create-card">
          <button type="button" class="project-create-card__close" aria-label="Close" data-project-modal-close>
            <span class="material-icons-outlined">close</span>
          </button>
          <div class="project-create-card__header">
            <h2 id="project-create-title" class="project-create-card__title">Create New Project</h2>
            <p id="project-create-subtitle" class="project-create-card__subtitle">Step 1 of 3: Let's start with the basics.</p>
          </div>
          <div class="project-create-card__body">
            <section class="project-create-step is-visible" data-form-step="1">
              <div class="project-field">
                <label for="project_name">Project Name <span class="is-required">*</span></label>
                <input id="project_name" name="project_name" type="text" placeholder="e.g. Website Redesign for Acme Corp" required />
                <p>Give your project a memorable name.</p>
              </div>
              <div class="project-field">
                <label for="project_description">Description</label>
                <textarea id="project_description" name="project_description" rows="4" placeholder="Briefly describe the scope of work..."></textarea>
              </div>
              <div class="project-row">
                <div class="project-field">
                  <label for="project_start_date">Start Date</label>
                  <div class="project-input-icon">
                    <span class="material-icons-outlined">calendar_today</span>
                    <input id="project_start_date" name="project_start_date" type="date" />
                  </div>
                </div>
                <div class="project-field">
                  <label for="project_priority">Priority Level</label>
                  <div class="project-input-icon">
                    <span class="material-icons-outlined">flag</span>
                    <select id="project_priority" name="project_priority">
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>
              </div>
            </section>
            <section class="project-create-step" data-form-step="2">
              <div class="project-field">
                <label for="project_client">Existing Client <span class="is-required">*</span></label>
                <div class="project-input-icon">
                  <span class="material-icons-outlined">search</span>
                  <input id="project_client" name="project_client" type="text" list="project-client-options" placeholder="Search for a client..." required />
                </div>
                <datalist id="project-client-options">
                  <option value="Acme Corp"></option>
                  <option value="Global Solutions Ltd."></option>
                  <option value="Tech Innovators Inc."></option>
                </datalist>
                <p>Select the client this project belongs to.</p>
              </div>
              <div class="project-divider"><span>OR</span></div>
              <button type="button" class="project-add-client-btn">
                <span class="material-icons-outlined">add</span>
                Add New Client
              </button>
              <p class="project-help-line">Create a new client profile instantly if they are not in the list.</p>
            </section>
            <section class="project-create-step" data-form-step="3">
              <div class="project-toggle-card">
                <div>
                  <h3>Billable Project</h3>
                  <p>Is this project billable to the client?</p>
                </div>
                <label class="project-switch">
                  <input id="project_billable" name="project_billable" type="checkbox" checked />
                  <span class="project-switch__slider"></span>
                </label>
              </div>
              <div class="project-row">
                <div class="project-field">
                  <label for="project_budget">Total Budget</label>
                  <div class="project-input-icon project-input-money">
                    <span class="material-icons-outlined">attach_money</span>
                    <input id="project_budget" name="project_budget" type="number" placeholder="0.00" min="0" step="0.01" />
                    <span class="project-input-suffix">USD</span>
                  </div>
                </div>
                <div class="project-field">
                  <label for="project_end_date">Estimated End Date</label>
                  <div class="project-input-icon">
                    <span class="material-icons-outlined">event</span>
                    <input id="project_end_date" name="project_end_date" type="date" />
                  </div>
                </div>
              </div>
              <button type="button" class="project-milestone-btn">
                <span class="material-icons-outlined">add_circle_outline</span>
                Add milestone payments (Optional)
              </button>
            </section>
          </div>
          <div class="project-create-card__footer">
            <button type="button" class="project-btn project-btn--ghost" data-project-modal-close>Cancel</button>
            <div class="project-footer-actions">
              <button id="project-back-btn" type="button" class="project-btn project-btn--outline is-hidden">Back</button>
              <button id="project-next-btn" type="button" class="project-btn project-btn--primary">
                <span class="next-label">Next Step</span>
                <span class="material-icons-outlined">arrow_forward</span>
              </button>
              <button id="project-submit-btn" type="submit" class="project-btn project-btn--primary is-hidden">
                <span class="material-icons-outlined">check_circle</span>
                Create Project
              </button>
            </div>
          </div>
        </form>
        <div id="create-client-modal" class="create-client-modal hidden" aria-hidden="true">
          <div class="create-client-modal__backdrop" data-client-modal-close></div>
          <div class="create-client-modal__dialog" role="dialog" aria-modal="true" aria-labelledby="create-client-title">
            <form id="create-client-form" class="create-client-card">
              <button type="button" class="create-client-card__close" aria-label="Close client modal" data-client-modal-close>
                <span class="material-icons-outlined">close</span>
              </button>
              <div class="create-client-card__header">
                <h3 id="create-client-title" class="create-client-card__title">Add New Client</h3>
                <p class="create-client-card__subtitle">Create a client profile without leaving project setup.</p>
              </div>
              <div class="create-client-card__body">
                <div class="project-field">
                  <label for="new_client_name">Client Name <span class="is-required">*</span></label>
                  <input id="new_client_name" name="new_client_name" type="text" placeholder="e.g. Orbit Labs" required />
                </div>
                <div class="project-row">
                  <div class="project-field">
                    <label for="new_client_email">Email <span class="is-required">*</span></label>
                    <input id="new_client_email" name="new_client_email" type="email" placeholder="name@company.com" required />
                  </div>
                  <div class="project-field">
                    <label for="new_client_phone">Phone</label>
                    <input id="new_client_phone" name="new_client_phone" type="tel" placeholder="+1 (555) 000-0000" />
                  </div>
                </div>
                <div class="project-field">
                  <label for="new_client_notes">Notes</label>
                  <textarea id="new_client_notes" name="new_client_notes" rows="3" placeholder="Anything important about this client..."></textarea>
                </div>
                <p id="new-client-feedback" class="project-help-line"></p>
              </div>
              <div class="create-client-card__footer">
                <button type="button" class="project-btn project-btn--ghost" data-client-modal-close>Cancel</button>
                <button type="submit" class="project-btn project-btn--primary">
                  <span class="material-icons-outlined">person_add</span>
                  Save Client
                </button>
              </div>
            </form>
          </div>
        </div>
        <p id="project-create-help" class="project-create-modal__help">
          <span class="material-icons-outlined">info</span>
          Need help? Check our <a href="#">Project Creation Guide</a>.
        </p>
      </div>
    </div>`;

  document.body.appendChild(wrapper.firstElementChild);
}

function bindSharedProjectCreateOpeners() {
  var primary = document.getElementById("open-project-create-modal");
  var extras = document.querySelectorAll("[data-open-project-create]");
  if (!primary) return;
  for (var i = 0; i < extras.length; i++) {
    extras[i].addEventListener("click", function (e) {
      e.preventDefault();
      primary.click();
    });
  }
}

function initSharedProjectCreateModal() {
  ensureSharedProjectCreateModal();
  bindSharedProjectCreateOpeners();
}

window.initSharedProjectCreateModal = initSharedProjectCreateModal;
