
class Etablissement {
  static async findAll() {
    const [rows] = await db.query('SELECT * FROM etablissements');
    return rows;
  }

  static async findById(id) {
    const [rows] = await db.query('SELECT * FROM etablissements WHERE Id_Etablissement = ?', [id]);
    return rows[0];
  }

  static async addEtab({ NomEtab, Password, Email }) {
    const [result] = await db.query(
      'INSERT INTO etablissements (NomEtab, Password, Email) VALUES (?, ?, ?)',
      [NomEtab, Password, Email]
    );
    return result.insertId;
  }

  // Assign a student to this etablissement
  static async affectToStud(etablissementId, stagiaireId) {
    const [result] = await db.query(
      'UPDATE stagiaires SET Id_Etablissement = ? WHERE Id_Stagiaire = ?',
      [etablissementId, stagiaireId]
    );
    return result.affectedRows > 0;
  }

  static async remove(id) {
    const [result] = await db.query('DELETE FROM etablissements WHERE Id_Etablissement = ?', [id]);
    return result.affectedRows > 0;
  }
}

module.exports = Etablissement;