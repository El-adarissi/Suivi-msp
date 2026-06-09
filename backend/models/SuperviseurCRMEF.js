class SuperviseurCRMEF {
  static async findAll() {
    const [rows] = await db.query('SELECT * FROM superviseurs_crmef');
    return rows;
  }

  static async findById(id) {
    const [rows] = await db.query('SELECT * FROM superviseurs_crmef WHERE Id_Superviseur = ?', [id]);
    return rows[0];
  }

  static async createAcc({ NomSup, PrenomSup, Password, Email }) {
    const [result] = await db.query(
      'INSERT INTO superviseurs_crmef (NomSup, PrenomSup, Password, Email) VALUES (?, ?, ?, ?)',
      [NomSup, PrenomSup, Password, Email]
    );
    return result.insertId;
  }

  static async viewReport(rapportId) {
    const [rows] = await db.query('SELECT * FROM rapports WHERE Id_Rapport = ?', [rapportId]);
    return rows[0];
  }

  static async addComment(rapportId, comment) {
    const [result] = await db.query(
      'INSERT INTO rapport_comments (Id_Rapport, comment) VALUES (?, ?)',
      [rapportId, comment]
    );
    return result.insertId;
  }

  // Assign a student to this supervisor
  static async affectToStud(superviseurId, stagiaireId) {
    const [result] = await db.query(
      'UPDATE stagiaires SET Id_Superviseur = ? WHERE Id_Stagiaire = ?',
      [superviseurId, stagiaireId]
    );
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await db.query('DELETE FROM superviseurs_crmef WHERE Id_Superviseur = ?', [id]);
    return result.affectedRows > 0;
  }
}

module.exports = SuperviseurCRMEF;