import SwiftUI

struct MembersSheet: View {
    let team: Team

    var body: some View {
        NavigationStack {
            List {
                Section(team.displayName) {
                    ForEach(team.members) { member in
                        Text(member.name)
                    }
                }
            }
            .navigationTitle("Members")
            .navigationBarTitleDisplayMode(.inline)
        }
    }
}

#Preview {
    MembersSheet(team: TeamSampleData.teams[0])
}
