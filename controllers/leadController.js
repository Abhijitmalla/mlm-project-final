import db from "../config/db.js";

export const convertToLead = (req, res) => {
    const { id } = req.params;

    // Get enquiry by ID
    db.query(
        "SELECT * FROM service_enquiries WHERE id = ?",
        [id],
        (err, results) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: err.message
                });
            }

            if (results.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Enquiry not found"
                });
            }

          const enquiry = results[0];

// Check status
if (enquiry.status !== "Contacted") {
    return res.status(400).json({
        success: false,
        message: "Only enquiries with 'Contacted' status can be converted to a lead."
    });
}

// Insert into leads table
const insertQuery = `
    INSERT INTO leads
    (service_name, name, mobile, email, source)
    VALUES (?, ?, ?, ?, ?)
`;


            db.query(
                insertQuery,
                [
                    enquiry.service_name,
                    enquiry.name,
                    enquiry.mobile,
                    enquiry.email,
                    req.body.source || enquiry.source || null
                ],
                (insertErr) => {

                    if (insertErr) {
                        return res.status(500).json({
                            success: false,
                            message: insertErr.message
                        });
                    }

                    // Delete from enquiry table
                    db.query(
                        "DELETE FROM service_enquiries WHERE id = ?",
                        [id],
                        (deleteErr) => {

                            if (deleteErr) {
                                return res.status(500).json({
                                    success: false,
                                    message: deleteErr.message
                                });
                            }

                            res.status(200).json({
                                success: true,
                                message: "Lead created successfully."
                            });

                        }
                    );

                }
            );
        }
    );
};

export const getAllLeads = (req, res) => {
    const sql = "SELECT * FROM leads ORDER BY id DESC";

    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: err.message
            });
        }

        res.status(200).json({
            success: true,
            data: results
        });
    });
};

export const updateLeadStatus = (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
        return res.status(400).json({
            success: false,
            message: "Status is required"
        });
    }

    const updateQuery = "UPDATE leads SET status = ? WHERE id = ?";

    db.query(updateQuery, [status, id], (err, results) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: err.message
            });
        }
        
        if (results.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Lead not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Lead status updated successfully"
        });
    });
};

export const updateLeadAmount = (req, res) => {
    const { id } = req.params;
    const { amount } = req.body;

    // Check if amount is provided (can be 0 or empty, so careful with just !amount)
    if (amount === undefined || amount === null) {
        return res.status(400).json({
            success: false,
            message: "Amount is required"
        });
    }

    const updateQuery = "UPDATE leads SET amount = ? WHERE id = ?";

    db.query(updateQuery, [amount, id], (err, results) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: err.message
            });
        }
        
        if (results.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Lead not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Lead amount updated successfully"
        });
    });
};



export const deleteLead = (req, res) => {
    const { id } = req.params;

    // Get lead
    db.query(
        "SELECT * FROM leads WHERE id = ?",
        [id],
        (err, results) => {

            if (err) {
                return res.status(500).json({
                    success: false,
                    message: err.message
                });
            }

            if (results.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Lead not found"
                });
            }

            const lead = results[0];

            const archiveQuery = `
                INSERT INTO leads_archive
                (service_name, name, mobile, email, source, status, amount)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `;

            db.query(
                archiveQuery,
                [
                    lead.service_name,
                    lead.name,
                    lead.mobile,
                    lead.email,
                    lead.source,
                    lead.status,
                    lead.amount
                ],
                (archiveErr) => {

                    if (archiveErr) {
                        return res.status(500).json({
                            success: false,
                            message: archiveErr.message
                        });
                    }

                    db.query(
                        "DELETE FROM leads WHERE id = ?",
                        [id],
                        (deleteErr) => {

                            if (deleteErr) {
                                return res.status(500).json({
                                    success: false,
                                    message: deleteErr.message
                                });
                            }

                            res.status(200).json({
                                success: true,
                                message: "Lead archived successfully."
                            });

                        }
                    );

                }
            );

        }
    );
};


export const getArchivedLeads = (req, res) => {

    db.query(
        "SELECT * FROM leads_archive ORDER BY deleted_at DESC",
        (err, results) => {

            if (err) {
                return res.status(500).json({
                    success: false,
                    message: err.message
                });
            }

            res.status(200).json({
                success: true,
                data: results
            });

        }
    );

};


export const deleteArchivedLead = (req, res) => {
    const { id } = req.params;

    const deleteQuery = "DELETE FROM leads_archive WHERE id = ?";

    db.query(deleteQuery, [id], (err, result) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: err.message
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Archived lead not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Archived lead deleted permanently."
        });
    });
};
