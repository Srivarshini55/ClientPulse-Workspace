package clientpulse.controller;

import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import clientpulse.entity.Enquiry;
import clientpulse.service.EnquiryService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/enquiries")
@CrossOrigin(origins = "http://localhost:5173")
public class EnquiryController {

    private final EnquiryService enquiryService;

    public EnquiryController(EnquiryService enquiryService) {
        this.enquiryService = enquiryService;
    }

    @PostMapping
    public Enquiry createEnquiry(@Valid @RequestBody Enquiry enquiry) {
        return enquiryService.createEnquiry(enquiry);
    }

    @GetMapping
    public List<Enquiry> getAllEnquiries() {
        return enquiryService.getAllEnquiries();
    }

    @GetMapping("/search")
    public List<Enquiry> searchEnquiries(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String source,
            @RequestParam(required = false) String assignedPerson) {

        return enquiryService.searchEnquiries(
                keyword, status, source, assignedPerson);
    }

    @GetMapping("/{id}")
    public Enquiry getEnquiryById(@PathVariable Long id) {
        return enquiryService.getEnquiryById(id);
    }

    @PutMapping("/{id}")
    public Enquiry updateEnquiry(
            @PathVariable Long id,
            @Valid @RequestBody Enquiry enquiry) {

        return enquiryService.updateEnquiry(id, enquiry);
    }

    @DeleteMapping("/{id}")
    public String deleteEnquiry(@PathVariable Long id) {
        enquiryService.deleteEnquiry(id);
        return "Enquiry deleted successfully";
    }
}