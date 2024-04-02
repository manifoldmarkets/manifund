import ArticlePage from '@/components/article-page'
import { Fragment } from 'react'

export default function ApproachPage4() {
  const content = (
    <Fragment>
      <p>
        Let’s apply this framework to some existing fundraising models, as well as some more experimental ones.
      </p>
      <h3>The startup model</h3>
      A startup founder raises money to run an early-stage company by selling equity in the company’s stock. <br/>
      <p>
        <strong>Predict:</strong> investors
      </p>
      <p>
        <strong>Front:</strong> investors
      </p>
      <p>
        <strong>Execute:</strong> founder
      </p>
      <p>
        <strong>Evaluate:</strong> consumers
      </p>
      <p>
        <strong>Pay out:</strong> consumers
      </p>
      <p>
        <strong>Benefit:</strong> founder (as profit), investors (as profit), consumers (as consumer surplus)
      </p>
      <h3>The bootstrapping model</h3>
      A founder starts a company with their own money, rather than selling equity early. <br/>
      <p>
        <strong>Predict:</strong> founder
      </p>
      <p>
        <strong>Front:</strong> founder
      </p>
      <p>
        <strong>Execute:</strong> founder
      </p>
      <p>
        <strong>Evaluate:</strong> consumers
      </p>
      <p>
        <strong>Pay out:</strong> consumers
      </p>
      <p>
        <strong>Benefit:</strong> founder (as profit), consumers (as consumer surplus)
      </p>
      <h3>The government model</h3>
      The government taxes citizens and uses the proceeds to pay for public-benefit projects. <br/>
      <p>
        <strong>Predict:</strong> elected officials or bureaucrats
      </p>
      <p>
        <strong>Front:</strong> citizens (as taxpayers)
      </p>
      <p>
        <strong>Execute:</strong> contractors
      </p>
      <p>
        <strong>Evaluate:</strong> citizens (indirectly, as voters)
      </p>
      <p>
        <strong>Pay out:</strong> citizens (as taxpayers)
      </p>
      <p>
        <strong>Benefit:</strong> citizens, contractors (as profit), officials (as goodwill for
        subsequent elections)
      </p>
      <h3>The wealthy philanthropist model</h3>
      A wealthy person or family donates large sums of money to charity. <br/>
      <p>
        <strong>Predict:</strong> donor
      </p>
      <p>
        <strong>Front:</strong> donor
      </p>
      <p>
        <strong>Execute:</strong> donor
      </p>
      <p>
        <strong>Evaluate:</strong> donor
      </p>
      <p>
        <strong>Pay out:</strong> donor
      </p>
      <p>
        <strong>Benefit:</strong> charity beneficiaries
      </p>
      <h3>The classical effective altruism model</h3>
      Altruistically-minded people try to donate to charities that will have the most marginal impact. <br/>
      <p>
        <strong>Predict:</strong> donor, with an Our World In Data tab open
      </p>
      <p>
        <strong>Front:</strong> donor
      </p>
      <p>
        <strong>Execute:</strong> donor
      </p>
      <p>
        <strong>Evaluate:</strong> donor
      </p>
      <p>
        <strong>Pay out:</strong> donor
      </p>
      <p>
        <strong>Benefit:</strong> charity beneficiaries
      </p>
      <h3>The charity evaluator model</h3>
      An organization assesses the effectiveness of various charities, and then donors either donate to those charities
      directly, or donate to the organization which then funds its chosen charities. <br/>
      <p>
        <strong>Predict:</strong> charity evaluator
      </p>
      <p>
        <strong>Front:</strong> donors
      </p>
      <p>
        <strong>Execute:</strong> founders
      </p>
      <p>
        <strong>Evaluate:</strong> charity evaluator
      </p>
      <p>
        <strong>Pay out:</strong> donors
      </p>
      <p>
        <strong>Benefit:</strong> charity beneficiaries
      </p>
      <h3>The impact certificate model</h3>
      Donors offer to retroactively award prizes for successful charitable projects.
      The founder of a such a project funds their efforts by selling equity in whatever prize money the project later receives. <br/>
      <p>
        <strong>Predict:</strong> investors
      </p>
      <p>
        <strong>Front:</strong> investors
      </p>
      <p>
        <strong>Execute:</strong> founder
      </p>
      <p>
        <strong>Evaluate:</strong> donor
      </p>
      <p>
        <strong>Pay out:</strong> donor
      </p>
      <p>
        <strong>Benefit:</strong> founder (as profit), investors (as profit), charity beneficiaries
      </p>
      <h3>The quadratic funding model</h3>
      Philanthropic sponsors fund a matching pool, whose funds are used to match donations to public-goods
      projects in a way that incentivizes small donors to donate to the projects that most benefit other donors
      too. <br/>
      <p>

        <strong>Predict:</strong> contributors
      </p>
      <p>
        <strong>Front:</strong> contributors and matching-pool sponsors
      </p>
      <p>
        <strong>Execute:</strong> founder
      </p>
      <p>
        <strong>Evaluate:</strong> contributors
      </p>
      <p>
        <strong>Pay out:</strong> contributors and matching-pool sponsors
      </p>
      <p>
        <strong>Benefit:</strong> contributors
      </p>
    </Fragment>
  )
  return <ArticlePage
    articleTitle="A Framework for Funding Experiments"
    pageTitle="Some Examples"
    prevLink="/articles/approach/3"
    nextLink="/articles/approach/5"
    nextLinkText="Next: Observations about these examples"
    content={content}
  />
}