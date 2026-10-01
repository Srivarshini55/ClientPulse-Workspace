package clientpulse.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import clientpulse.entity.Enquiry;

public interface EnquiryRepository extends JpaRepository<Enquiry, Long> {
}