import { Team } from '../types';

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export const Validator = {
  isValidEmail: (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  },

  isValidPhone: (phone: string): boolean => {
    // Bangladeshi mobile format: starts with 013-019 followed by 8 digits
    const cleaned = phone.replace(/[\s-]/g, '');
    return /^(\+?88)?01[3-9]\d{8}$/.test(cleaned);
  },

  isValidStudentId: (studentId: string): boolean => {
    // Varendra University Student ID pattern: typically 9 digits, e.g. 211311042
    const cleaned = studentId.replace(/[\s-]/g, '');
    return /^\d{6,12}$/.test(cleaned);
  },

  validateTeamRegistration: (
    teamData: {
      name: string;
      batch: string;
      department: string;
    },
    members: Array<{
      fullName: string;
      studentId: string;
      phone: string;
      email: string;
    }>,
    payment: {
      method: string;
      senderNumber: string;
      transactionId: string;
    },
    existingTeams: Team[]
  ): ValidationResult => {
    const errors: Record<string, string> = {};

    // 1. Team validations
    if (!teamData.name.trim()) {
      errors.teamName = 'Team name is required.';
    } else if (teamData.name.trim().length < 3) {
      errors.teamName = 'Team name must be at least 3 characters.';
    } else {
      const isDuplicateTeamName = existingTeams.some(
        t => t.name.trim().toLowerCase() === teamData.name.trim().toLowerCase()
      );
      if (isDuplicateTeamName) {
        errors.teamName = 'A team with this name is already registered.';
      }
    }

    if (!teamData.batch) {
      errors.batch = 'Batch selection is required.';
    }

    // 2. Members validation
    if (members.length !== 3) {
      errors.members = 'A team must have exactly 3 debaters.';
    }

    const seenStudentIds = new Set<string>();
    const seenEmails = new Set<string>();

    members.forEach((m, idx) => {
      const prefix = `member_${idx + 1}`;
      
      if (!m.fullName.trim()) {
        errors[`${prefix}_name`] = `Speaker ${idx + 1} full name is required.`;
      }

      if (!m.studentId.trim()) {
        errors[`${prefix}_studentId`] = `Speaker ${idx + 1} Student ID is required.`;
      } else if (!Validator.isValidStudentId(m.studentId)) {
        errors[`${prefix}_studentId`] = `Enter a valid Student ID.`;
      } else {
        const cleanedId = m.studentId.trim();
        // Check for duplicates inside same team submission
        if (seenStudentIds.has(cleanedId)) {
          errors[`${prefix}_studentId`] = `Duplicate Student ID inside team.`;
        }
        seenStudentIds.add(cleanedId);

        // Check if student is already in another registered team
        const alreadyRegistered = existingTeams.some(t =>
          t.members.some(mem => mem.studentId.trim() === cleanedId)
        );
        if (alreadyRegistered) {
          errors[`${prefix}_studentId`] = `Student ID ${cleanedId} is already registered in another team.`;
        }
      }

      if (!m.phone.trim()) {
        errors[`${prefix}_phone`] = `Speaker ${idx + 1} phone is required.`;
      } else if (!Validator.isValidPhone(m.phone)) {
        errors[`${prefix}_phone`] = `Enter a valid 11-digit mobile number.`;
      }

      // Email is now optional (mobile phone only requested)
      if (m.email && m.email.trim()) {
        if (!Validator.isValidEmail(m.email)) {
          errors[`${prefix}_email`] = `Enter a valid email address.`;
        } else {
          const cleanedEmail = m.email.trim().toLowerCase();
          if (seenEmails.has(cleanedEmail)) {
            errors[`${prefix}_email`] = `Duplicate email inside team.`;
          }
          seenEmails.add(cleanedEmail);
        }
      }
    });

    // 3. Payment validation
    if (!payment.senderNumber.trim()) {
      errors.paymentSender = 'Sender phone number is required.';
    } else if (!Validator.isValidPhone(payment.senderNumber)) {
      errors.paymentSender = 'Enter a valid 11-digit sender phone number.';
    }

    if (!payment.transactionId.trim()) {
      errors.paymentTrx = 'Transaction ID (TrxID) is required.';
    } else if (payment.transactionId.trim().length < 6) {
      errors.paymentTrx = 'Transaction ID must be at least 6 characters.';
    } else {
      const cleanTrx = payment.transactionId.trim().toUpperCase();
      const duplicateTrx = existingTeams.some(
        t => t.payment.transactionId.trim().toUpperCase() === cleanTrx
      );
      if (duplicateTrx) {
        errors.paymentTrx = 'This Transaction ID has already been submitted for another team.';
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
};
