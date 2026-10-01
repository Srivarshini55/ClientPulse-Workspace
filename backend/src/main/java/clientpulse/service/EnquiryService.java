package clientpulse.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import clientpulse.entity.Enquiry;
import clientpulse.repository.EnquiryRepository;

@Service
public class EnquiryService {

    private final EnquiryRepository enquiryRepository;

    public EnquiryService(EnquiryRepository enquiryRepository) {
        this.enquiryRepository = enquiryRepository;
    }

    // Create
    public Enquiry createEnquiry(Enquiry enquiry) {
        return enquiryRepository.save(enquiry);
    }

    // Get All
    public List<Enquiry> getAllEnquiries() {
        return enquiryRepository.findAll();
    }

    // Get By ID
    public Enquiry getEnquiryById(Long id) {
        return enquiryRepository.findById(id)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Enquiry not found with id: " + id
                        )
                );
    }

    // Update
    public Enquiry updateEnquiry(Long id, Enquiry enquiry) {

        Enquiry existing = enquiryRepository.findById(id)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Enquiry not found with id: " + id
                        )
                );

        existing.setClientCompanyName(enquiry.getClientCompanyName());
        existing.setContactPerson(enquiry.getContactPerson());
        existing.setEmail(enquiry.getEmail());
        existing.setPhone(enquiry.getPhone());
        existing.setEnquirySource(enquiry.getEnquirySource());
        existing.setServiceRequirement(enquiry.getServiceRequirement());
        existing.setRequirementDescription(enquiry.getRequirementDescription());
        existing.setEstimatedBudget(enquiry.getEstimatedBudget());
        existing.setStatus(enquiry.getStatus());
        existing.setAssignedPerson(enquiry.getAssignedPerson());
        existing.setNextFollowUpDate(enquiry.getNextFollowUpDate());
        existing.setAdditionalNotes(enquiry.getAdditionalNotes());

        return enquiryRepository.save(existing);
    }

    // Delete
    public void deleteEnquiry(Long id) {

        if (!enquiryRepository.existsById(id)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Enquiry not found with id: " + id
            );
        }

        enquiryRepository.deleteById(id);
    }

    // Search + Filter
    public List<Enquiry> searchEnquiries(
        String keyword,
        String status,
        String source,
        String assignedPerson) {

    return enquiryRepository.findAll().stream()

            // Keyword search
            .filter(e -> keyword == null || keyword.isBlank()
                    || (e.getClientCompanyName() != null
                    && e.getClientCompanyName()
                    .toLowerCase()
                    .contains(keyword.toLowerCase()))
                    || (e.getContactPerson() != null
                    && e.getContactPerson()
                    .toLowerCase()
                    .contains(keyword.toLowerCase()))
                    || (e.getEmail() != null
                    && e.getEmail()
                    .toLowerCase()
                    .contains(keyword.toLowerCase())))

            // Status filter
            .filter(e -> status == null || status.isBlank()
                    || (e.getStatus() != null
                    && e.getStatus().equalsIgnoreCase(status)))

            // Source filter
            .filter(e -> source == null || source.isBlank()
                    || (e.getEnquirySource() != null
                    && e.getEnquirySource().equalsIgnoreCase(source)))

            // Assigned Person filter
            .filter(e -> assignedPerson == null || assignedPerson.isBlank()
                    || (e.getAssignedPerson() != null
                    && e.getAssignedPerson().equalsIgnoreCase(assignedPerson)))

            .toList();

    }
}